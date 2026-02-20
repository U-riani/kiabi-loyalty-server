// backend/services/apexService.js

export const registerInApex = async (payload) => {
  // -----------------------------
  // 1️⃣ Validate configuration
  // -----------------------------
  if (!process.env.APEX_REGISTER_URL) {
    const error = new Error("Apex endpoint not configured");
    error.code = "CONFIG_ERROR";
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    // -----------------------------
    // 2️⃣ Send request to Apex
    // -----------------------------
    const response = await fetch(process.env.APEX_REGISTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    // -----------------------------
    // 3️⃣ HTTP level validation
    // -----------------------------
    if (!response.ok) {
      const error = new Error("Apex returned HTTP error");
      error.code = "APEX_HTTP_ERROR";
      error.status = response.status;
      throw error;
    }

    // -----------------------------
    // 4️⃣ Parse JSON safely
    // -----------------------------
    let result;
    try {
      result = await response.json();
    } catch {
      const error = new Error("Invalid JSON response from Apex");
      error.code = "APEX_INVALID_RESPONSE";
      throw error;
    }

    // -----------------------------
    // 5️⃣ Validate expected schema
    // -----------------------------
    if (!result || typeof result.status !== "string") {
      const error = new Error("Unexpected Apex response structure");
      error.code = "APEX_INVALID_RESPONSE";
      throw error;
    }

    return result;
  } catch (err) {
    // -----------------------------
    // 6️⃣ Timeout handling
    // -----------------------------
    if (err.name === "AbortError") {
      const timeoutError = new Error("Apex server timeout");
      timeoutError.code = "APEX_TIMEOUT";
      throw timeoutError;
    }

    // -----------------------------
    // 7️⃣ Network errors
    // -----------------------------
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      const networkError = new Error("Apex server unreachable");
      networkError.code = "APEX_NETWORK_ERROR";
      throw networkError;
    }

    // If already tagged error, rethrow as-is
    if (err.code) {
      throw err;
    }

    // Fallback unknown error
    const unknownError = new Error("Unknown Apex integration error");
    unknownError.code = "APEX_UNKNOWN_ERROR";
    throw unknownError;
  } finally {
    clearTimeout(timeout);
  }
};

export const updateInApex = async (payload) => {
  if (!process.env.APEX_UPDATE_URL) {
    const error = new Error("Apex update endpoint not configured");
    error.code = "CONFIG_ERROR";
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(process.env.APEX_UPDATE_URL, {
      method: "POST", // or PUT depending on Apex
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = new Error("Apex returned HTTP error");
      error.code = "APEX_HTTP_ERROR";
      error.status = response.status;
      throw error;
    }

    let result;
    try {
      result = await response.json();
    } catch {
      const error = new Error("Invalid JSON response from Apex");
      error.code = "APEX_INVALID_RESPONSE";
      throw error;
    }

    if (!result || typeof result.status !== "string") {
      const error = new Error("Unexpected Apex response structure");
      error.code = "APEX_INVALID_RESPONSE";
      throw error;
    }

    return result;
  } catch (err) {
    if (err.name === "AbortError") {
      const timeoutError = new Error("Apex server timeout");
      timeoutError.code = "APEX_TIMEOUT";
      throw timeoutError;
    }

    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      const networkError = new Error("Apex server unreachable");
      networkError.code = "APEX_NETWORK_ERROR";
      throw networkError;
    }

    if (err.code) {
      throw err;
    }

    const unknownError = new Error("Unknown Apex update error");
    unknownError.code = "APEX_UNKNOWN_ERROR";
    throw unknownError;
  } finally {
    clearTimeout(timeout);
  }
};
