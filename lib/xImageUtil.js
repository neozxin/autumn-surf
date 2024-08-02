import qrcode from "qrcode";
import * as htmlToImage from "html-to-image";
import html2canvas from "html2canvas";

export const xImageUtil = (() => {
  // /** @type {import('qrcode')} */
  // const qrcode = globalThis.require?.('qrcode');
  // /** @type {import('html-to-image')} */
  // const htmlToImage = globalThis.require?.('html-to-image');
  // /** @type {import('html2canvas')} */
  // const html2canvas = globalThis.require?.('html2canvas');
  return {
    xModules: {
      qrcode,
      htmlToImage,
      html2canvas,
    },
    /** Usage: document.body.append((await generateQrCodeOfString('this is the test string to be generated as qrcode', {})).canvasEl) */
    async generateQrCodeOfString(srcContent, options) {
      return new Promise((resolve, reject) => {
        try {
          const isNodeEnv = typeof globalThis.global === "object";
          const defaultOptions = {
            width: 128,
            color: {
              dark: "#00ff00ff",
              light: "#ffffffff",
            },
            errorCorrectionLevel: "H",
          };
          const generatingDataURL = qrcode.toDataURL(srcContent, {
            ...defaultOptions,
            ...options,
          });
          const generatingCanvas = isNodeEnv
            ? null
            : qrcode.toCanvas(srcContent, { ...defaultOptions, ...options });
          const generatingStringCode = qrcode.toString(srcContent, {
            ...defaultOptions,
            ...options,
          });
          Promise.all([
            generatingDataURL,
            generatingCanvas,
            generatingStringCode,
          ]).then(([dataUrl, canvasEl, stringCode]) =>
            resolve({ dataUrl, canvasEl, stringCode }),
          );
        } catch (err) {
          reject(err);
        }
      });
    },
    /** Usage: saveUrlToFile((await getSnapshotUrlOfElement(document.querySelector('body'), {})).dataUrl, 'testFilenameForBody.png') */
    saveUrlToFile(dataUrl, filename) {
      const tempLink = document.createElement("a");
      tempLink.download = filename;
      tempLink.href = dataUrl;
      tempLink.click();
    },
    /** Usage: document.body.append((await getSnapshotUrlOfElement(document.querySelector('body'), {})).imgEl) */
    async getSnapshotUrlOfElement(srcElement, options, useHtml2canvas) {
      const gettingHtml2canvas = async () => {
        const canvasEl = await html2canvas(srcElement);
        const dataUrl = canvasEl.toDataURL();
        return { dataUrl, canvasEl };
      };
      const gettingHtmlToImage = async () => {
        const defaultOptions = {
          filter: (node) => node.tagName !== "do-not-render-me", // do not render node with tagName 'do-not-render-me'
        };
        const dataUrl = await htmlToImage.toPng(srcElement, {
          ...defaultOptions,
          ...options,
        });
        const imgEl = document.createElement("img");
        imgEl.src = dataUrl;
        return { dataUrl, imgEl };
      };
      const result = await (useHtml2canvas
        ? gettingHtml2canvas()
        : gettingHtmlToImage());
      return result;
    },
    /** Usage: imgDataUrl = await url2Base64('testImageFilename.png') */
    async url2Base64(
      url,
      fillStyle = "white",
      crossOrigin = "*",
      type = "image/jpeg",
    ) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement("canvas");
        img.crossOrigin = crossOrigin;
        img.onload = function () {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = fillStyle;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const base64 = canvas.toDataURL(type);
          resolve(base64);
        };
        img.onerror = function () {
          reject(new Error("message"));
        };
        img.src = url;
      });
    },
  };
})();
