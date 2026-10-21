const assert = require("node:assert/strict");
const test = require("node:test");
const path = require("node:path");
const fs = require("node:fs");
const mongoose = require("mongoose");
const {
    app,
    hashPassword,
    verifyPassword,
    requiredString,
    requiredPassword,
    validEmail,
    validId
} = require("../server");
const Order = require("../models/order");
const Cart = require("../models/cart");
const { foods } = require("../seed");

test("seed defines exactly 15 unique dishes with local images", () => {
    assert.equal(foods.length, 15);
    assert.equal(new Set(foods.map(item => item.name)).size, 15);

    for (const item of foods) {
        assert.match(item.image, /^\/images\/[\w-]+\.jpg$/);
        const imagePath = path.resolve(__dirname, "../../frontend", item.image.slice(1));
        assert.ok(fs.existsSync(imagePath), `Missing image for ${item.name}: ${item.image}`);
    }
});

test("requiredString trims values and rejects empty input", () => {
    assert.equal(requiredString("  Sourabh  ", "Name"), "Sourabh");
    assert.throws(() => requiredString("   ", "Name"), { status: 400 });
    assert.throws(() => requiredString(42, "Name"), { status: 400 });
});

test("password validation preserves meaningful whitespace", () => {
    assert.equal(requiredPassword("  password  "), "  password  ");
    assert.throws(() => requiredPassword("  "), { status: 400 });
    assert.throws(() => requiredPassword("x".repeat(129)), { status: 400 });
});

test("email validation normalizes and rejects malformed addresses", () => {
    assert.equal(validEmail("  USER@example.com "), "user@example.com");
    assert.throws(() => validEmail("not-an-email"), { status: 400 });
});

test("object IDs are validated before database lookups", () => {
    const id = new mongoose.Types.ObjectId().toString();
    assert.equal(validId(id), id);
    assert.throws(() => validId("not-an-id"), { status: 400 });
});

test("password hashes verify correctly and legacy passwords remain compatible", async () => {
    const hashed = await hashPassword("correct horse");
    assert.match(hashed, /^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/);
    assert.equal(await verifyPassword("correct horse", hashed), true);
    assert.equal(await verifyPassword("wrong password", hashed), false);
    assert.equal(await verifyPassword("legacy", "legacy"), true);
    assert.equal(await verifyPassword("legacy", undefined), false);
});

test("order and cart schemas reject invalid persisted data", async () => {
    const invalidOrder = new Order({
        name: "A",
        phone: "123",
        address: "Address",
        payment: "Bitcoin",
        total: 0,
        status: "Unknown"
    });
    const orderError = await invalidOrder.validate().catch(error => error);
    assert.ok(orderError.errors.payment);
    assert.ok(orderError.errors.total);
    assert.ok(orderError.errors.status);

    const invalidCartItem = new Cart({
        userEmail: "user@example.com",
        foodName: "Pizza",
        price: 99,
        quantity: 0
    });
    const cartError = await invalidCartItem.validate().catch(error => error);
    assert.ok(cartError.errors.quantity);
});

test("health and unknown routes return structured API responses", async t => {
    const server = app.listen(0);
    t.after(() => new Promise(resolve => server.close(resolve)));
    await new Promise(resolve => server.once("listening", resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    const healthResponse = await fetch(`${baseUrl}/health`);
    assert.equal(healthResponse.status, 503);
    assert.equal((await healthResponse.json()).status, "database-unavailable");

    const missingResponse = await fetch(`${baseUrl}/does-not-exist`);
    assert.equal(missingResponse.status, 404);
    assert.deepEqual(await missingResponse.json(), {
        success: false,
        message: "Route not found"
    });

    const invalidBodyResponse = await fetch(`${baseUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(null)
    });
    assert.equal(invalidBodyResponse.status, 400);
});
