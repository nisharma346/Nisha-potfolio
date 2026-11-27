function sendApiError(res, error) {
    const isDuplicate = error?.code === 11000;
    const isInvalidData =
        error?.name === "ValidationError" || error?.name === "CastError";

    console.error(`API request failed (${error?.name || "Error"}).`);

    const status = isDuplicate ? 409 : isInvalidData ? 400 : 500;
    const message = isDuplicate
        ? "A record with the supplied values already exists."
        : isInvalidData
          ? "Invalid request data."
          : "The request could not be completed.";

    return res.status(status).json({ success: false, message });
}

module.exports = sendApiError;
