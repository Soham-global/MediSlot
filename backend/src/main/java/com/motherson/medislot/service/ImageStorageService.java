package com.motherson.medislot.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import com.motherson.medislot.config.AppProperties;
import com.motherson.medislot.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Uploads hospital / doctor photos to Cloudinary and returns the public https URL.
 * The Cloudinary API secret never leaves the server; the browser only ever sends the file to our API.
 * If the Cloudinary settings are empty the app still runs and uploads answer 503 with a clear message.
 */
@Service
public class ImageStorageService {
    private static final Logger log = LoggerFactory.getLogger(ImageStorageService.class);
    private static final long MAX_BYTES = 5L * 1024 * 1024;

    private final Cloudinary cloudinary;   // null when not configured

    public ImageStorageService(AppProperties props) {
        AppProperties.Cloudinary c = props.cloudinary();
        if (c != null && notBlank(c.cloudName()) && notBlank(c.apiKey()) && notBlank(c.apiSecret())) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", c.cloudName().trim(),
                    "api_key", c.apiKey().trim(),
                    "api_secret", c.apiSecret().trim(),
                    "secure", true));
        } else {
            this.cloudinary = null;
            log.warn("Cloudinary is not configured (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET) - image uploads are disabled.");
        }
    }

    /** @param folder e.g. "medislot/hospitals" or "medislot/doctors" */
    public String upload(MultipartFile file, String folder) {
        if (cloudinary == null) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Image uploads are not configured on the server. Ask the administrator to set the Cloudinary keys.");
        }
        if (file == null || file.isEmpty()) throw ApiException.badRequest("Please choose an image file.");
        if (file.getSize() > MAX_BYTES) throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "The image must be 5 MB or smaller.");

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw ApiException.badRequest("The image could not be read. Please try again.");
        }
        if (!looksLikeSupportedImage(bytes)) {
            throw ApiException.badRequest("Only JPG, PNG or WEBP images are allowed.");
        }

        try {
            Map<?, ?> result = cloudinary.uploader().upload(bytes, ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image",
                    "unique_filename", true,
                    "overwrite", false,
                    // shrink huge photos and let Cloudinary pick the best quality/size
                    "transformation", new Transformation().width(1200).height(1200).crop("limit").quality("auto")));
            Object url = result.get("secure_url");
            if (url == null) throw new IOException("Cloudinary returned no URL");
            return url.toString();
        } catch (Exception e) {
            log.error("Cloudinary upload failed", e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "The image could not be uploaded right now. Please try again.");
        }
    }

    /** Checks the real file signature (not just the name/Content-Type the browser claims). */
    static boolean looksLikeSupportedImage(byte[] b) {
        if (b.length < 12) return false;
        boolean jpeg = (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF;
        boolean png = (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G';
        boolean webp = b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
        return jpeg || png || webp;
    }

    private static boolean notBlank(String s) { return s != null && !s.isBlank(); }
}
