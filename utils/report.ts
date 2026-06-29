import { test } from "@playwright/test";

export async function attachJson(
    name: string,
    data: unknown
) {
    await test.info().attach(name, {
        body: JSON.stringify(data, null, 2),
        contentType: "application/json"
    });
}

export async function attachText(
    name: string,
    text: string
) {
    await test.info().attach(name, {
        body: text,
        contentType: "text/plain"
    });
}