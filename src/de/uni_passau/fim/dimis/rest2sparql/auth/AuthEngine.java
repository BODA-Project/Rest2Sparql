package de.uni_passau.fim.dimis.rest2sparql.auth;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;

/**
 * This class provides methods to create a salted hash and validate in id-hash-combination.
 */
public class AuthEngine {

    private final String SALT;
    private static HashMap<Character, Integer> ENCODING_MAP = new HashMap<>();
    private static final char[] ENCODING_TABLE = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'};

    static {
        ENCODING_MAP.put('0', 0);
        ENCODING_MAP.put('1', 1);
        ENCODING_MAP.put('2', 2);
        ENCODING_MAP.put('3', 3);
        ENCODING_MAP.put('4', 4);
        ENCODING_MAP.put('5', 5);
        ENCODING_MAP.put('6', 6);
        ENCODING_MAP.put('7', 7);
        ENCODING_MAP.put('8', 8);
        ENCODING_MAP.put('9', 9);
        ENCODING_MAP.put('a', 10);
        ENCODING_MAP.put('b', 11);
        ENCODING_MAP.put('c', 12);
        ENCODING_MAP.put('d', 13);
        ENCODING_MAP.put('e', 14);
        ENCODING_MAP.put('f', 15);
    }

    /**
     * Create a new {@link de.uni_passau.fim.dimis.rest2sparql.auth.AuthEngine}.
     *
     * @param salt The salt that is used to create new hashes and validate.
     */
    public AuthEngine(String salt) {
        SALT = salt;
    }

    /**
     * Creates a new sha-256 hash of the passed ID and the salt.
     *
     * @param ID The ID to hash.
     * @return The hash.
     * @throws NoSuchAlgorithmException     This should never happen!
     * @throws UnsupportedEncodingException This should never happen!
     */
    public String createHash(String ID) throws NoSuchAlgorithmException, UnsupportedEncodingException {

        MessageDigest md = MessageDigest.getInstance("SHA-256");

        String saltedId = ID + SALT;
        md.update(saltedId.getBytes("UTF-8"));

        byte[] digest = md.digest();

        return byteToHex(digest);

    }

    /**
     * Validates if the passed ID matches the hash.
     *
     * @param ID   The ID to check.
     * @param hash The hash to check the ID against.
     * @return {@code true} if the ID matches the hash, {@code false} otherwise.
     * @throws NoSuchAlgorithmException     This should never happen!
     * @throws UnsupportedEncodingException This should never happen!
     */
    public boolean checkHash(String ID, String hash) throws NoSuchAlgorithmException, UnsupportedEncodingException {

        MessageDigest md = MessageDigest.getInstance("SHA-256");

        String saltedId = ID + SALT;
        md.update(saltedId.getBytes("UTF-8"));

        byte[] digest = md.digest();

        return (byteToHex(digest)).equals(hash);

    }

    /**
     * Transform a byte array to a hex-String.
     *
     * @param raw The byte array to transform.
     * @return The hex-String.
     */
    private static String byteToHex(byte[] raw) {

        StringBuilder sb = new StringBuilder();

        for (byte b : raw) {
            int a = b + 128; // byte is [-128, 127]
            sb.append(ENCODING_TABLE[a / 16]);
            sb.append(ENCODING_TABLE[a % 16]);
        }

        return sb.toString();
    }

    /**
     * Transform a hex-String to a byte array.
     *
     * @param hex The hex-String to transform.
     * @return The byte array.
     */
    @SuppressWarnings("unused")
    private static byte[] hexToByte(String hex) {

        byte[] raw = new byte[hex.length() / 2];

        for (int i = 0; i < hex.length(); i++) {
            int a = (ENCODING_MAP.get(hex.charAt(i * 2) * 16 + ENCODING_MAP.get(hex.charAt(i * 2 + 1)))) - 128;
            raw[i] = (byte) a;
        }

        return raw;
    }
}
