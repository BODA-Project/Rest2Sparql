package de.uni_passau.fim.dimis.rest2sparql.auth;

import org.junit.BeforeClass;
import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

/**
 * Created by tommy on 2/3/14.
 */
public class AuthEngineTest {

    private static AuthEngine authEngine;

    @BeforeClass
    public static void setUpBeforeClass() throws Exception {
        authEngine = new AuthEngine("12345");
    }

    @Test
    public void testCreateHash() throws Exception {

        String exp = "9f4bcf6125bc4a590db7db2e9a23349208f4818c15974019c4a6bf3b4c242fff";

        String hash = authEngine.createHash("asdf");

        assertEquals(exp, hash);
    }

    @Test
    public void testCheckHash() throws Exception {

        assertTrue(authEngine.checkHash("asdf", "9f4bcf6125bc4a590db7db2e9a23349208f4818c15974019c4a6bf3b4c242fff"));
        assertFalse(authEngine.checkHash("asdf", "9f4bcf6125bc4a590db7db2e9a23349208f4818c15974019c4a6bf3b4c242ff0"));
        assertFalse(authEngine.checkHash("asdg", "9f4bcf6125bc4a590db7db2e9a23349208f4818c15974019c4a6bf3b4c242fff"));

    }
}
