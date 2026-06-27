import { expect, test } from "@playwright/test";

const pixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8AARAwMDAxQAAAGAAH8U3H2AAAAAElFTkSuQmCC", "base64");
const fourPhotos = Array.from({ length: 4 }, (_, index) => ({ name: `photo-${index + 1}.png`, mimeType: "image/png", buffer: pixel }));
const fivePhotos = [...fourPhotos, { name: "photo-5.png", mimeType: "image/png", buffer: pixel }];

test("landing page is complete and responsive", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "A little photo booth, right in your browser." })).toBeVisible();
  await expect(page.getByRole("button", { name: /Step inside/ })).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
});

test("upload flow validates four images and opens the editor", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Step inside/ }).click();
  await page.getByRole("button", { name: /Upload photos/ }).click();
  const continueButton = page.getByRole("button", { name: /Style my strip/ });
  await expect(continueButton).toBeDisabled();
  const photoInput = page.locator('input[type="file"][multiple]');
  await photoInput.setInputFiles(fivePhotos);
  await expect(page.getByText("Choose no more than 4 photos.")).toBeVisible();
  await expect(page.getByText("0 / 4 spots filled")).toBeVisible();
  await photoInput.setInputFiles(fourPhotos);
  await expect(page.getByText("4 / 4 spots filled")).toBeVisible();
  await expect(continueButton).toBeEnabled();
  await continueButton.click();
  await expect(page.getByRole("heading", { name: "Make it feel like yours." })).toBeVisible();
  const stripPreview = page.getByRole("img", { name: "Live photo strip preview" });
  await expect(stripPreview).toBeVisible({ timeout: 15_000 });
  const originalPreview = await stripPreview.getAttribute("src");
  await page.getByRole("button", { name: "Warm film" }).click();
  await expect(page.getByRole("button", { name: "Warm film" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => stripPreview.getAttribute("src")).not.toBe(originalPreview);
  const warmPreview = await stripPreview.getAttribute("src");
  await page.getByRole("button", { name: "Pastel pink" }).click();
  await expect(page.getByRole("button", { name: "Pastel pink" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => stripPreview.getAttribute("src")).not.toBe(warmPreview);
  const pinkPreview = await stripPreview.getAttribute("src");
  await page.getByRole("button", { name: "Your handmade paper" }).click();
  await expect(page.getByRole("button", { name: "Your handmade paper" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => stripPreview.getAttribute("src")).not.toBe(pinkPreview);
  await expect(page.getByText("Your handmade paper", { exact: true })).toBeVisible();
  await expect(page.getByText("This artist paper keeps its original hand-drawn borders and finish exactly as designed.")).toBeVisible();
  const handmadePreview = await stripPreview.getAttribute("src");
  await page.getByRole("button", { name: "Moonlit dreams" }).click();
  await expect(page.getByRole("button", { name: "Moonlit dreams" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => stripPreview.getAttribute("src")).not.toBe(handmadePreview);
});

test("camera denial offers the upload fallback", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: async () => { throw new DOMException("Denied", "NotAllowedError"); } } });
  });
  await page.goto("/");
  await page.getByRole("button", { name: /Step inside/ }).click();
  await page.getByRole("button", { name: /Use my camera/ }).click();
  await page.getByRole("button", { name: /Allow camera/ }).click();
  await expect(page.getByRole("heading", { name: "The curtain stayed closed." })).toBeVisible();
  await expect(page.getByRole("button", { name: /Upload instead/ })).toBeVisible();
});

test("camera preview keeps its stream alive in development Strict Mode", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "desktop project only");
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => {
          const canvas = document.createElement("canvas");
          canvas.width = 640;
          canvas.height = 480;
          const context = canvas.getContext("2d");
          if (context) {
            context.fillStyle = "#a44d3d";
            context.fillRect(0, 0, canvas.width, canvas.height);
          }
          return canvas.captureStream(10);
        },
        enumerateDevices: async () => [],
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: /Step inside/ }).click();
  await page.getByRole("button", { name: /Use my camera/ }).click();
  await page.getByRole("button", { name: /Allow camera/ }).click();
  await expect.poll(() => page.locator("video").evaluate((video) => {
    const stream = (video as HTMLVideoElement).srcObject as MediaStream | null;
    return Boolean(stream?.getVideoTracks().some((track) => track.readyState === "live") && (video as HTMLVideoElement).videoWidth > 0);
  })).toBe(true);
  await page.getByRole("button", { name: "Take four photos" }).click();
  await expect(page.getByText("One second to switch your pose")).toBeVisible({ timeout: 6_000 });
});

test("generates and downloads a finished strip", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "desktop project only");
  await page.goto("/");
  await page.getByRole("button", { name: /Step inside/ }).click();
  await page.getByRole("button", { name: /Upload photos/ }).click();
  await page.locator('input[type="file"][multiple]').setInputFiles(fourPhotos);
  await page.getByRole("button", { name: /Style my strip/ }).click();
  await expect(page.getByRole("button", { name: /Print this strip/ })).toBeEnabled({ timeout: 15_000 });
  await page.getByRole("button", { name: /Print this strip/ }).click();
  await expect(page.getByRole("button", { name: "Pull out my strip" })).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Pull out my strip" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^sketchsnap-photo-strip-\d{4}-\d{2}-\d{2}\.png$/);
  await expect(page.getByRole("button", { name: "Save 4 photos" })).toBeEnabled();
  const photosDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save 4 photos" }).click();
  const photosDownload = await photosDownloadPromise;
  expect(photosDownload.suggestedFilename()).toMatch(/^sketchsnap-4-photos-\d{4}-\d{2}-\d{2}\.zip$/);
  await expect(page.getByText("Four individual photos saved in one ZIP file.")).toBeVisible();
});

test("mobile layout does not overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project only");
  await page.goto("/");
  const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.client);
});
