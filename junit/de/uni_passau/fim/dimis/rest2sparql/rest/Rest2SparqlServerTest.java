package de.uni_passau.fim.dimis.rest2sparql.rest;

import de.uni_passau.fim.dimis.rest2sparql.rest.restadapter.RestAdapter;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.BufferedHttpEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import java.net.URI;

import static org.junit.Assert.assertEquals;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/31/13
 * Time: 2:37 PM
 * To change this template use File | Settings | File Templates.
 */
public class Rest2SparqlServerTest {

    private static final String scheme = "http";
    private static final String host = "localhost";
    private static final int port = 8080;
    private static final String path = "/";

    @BeforeClass
    public static void setUpBeforeClass() throws Exception {
        Rest2SparqlServer server = new Rest2SparqlServer(new RestAdapter(), 8080);
        server.startServer();
    }

    @Test
    public void testInvalidURL_NoFunc() throws Exception {

        String exp = "The URL contains invalid parameters!\n" +
                "Here is a list:\n" +
                "No parameter found that indicates which function to use!\n";

        URI uri = null;
        uri = new URIBuilder()
                .setScheme(scheme)
                .setHost(host)
                .setPort(port)
                .setPath(path)
                .addParameter("c", "someCube")
                .build();

        HttpGet htpg = new HttpGet(uri);
        //htpg.addHeader("Accept", format.mimeType);
        CloseableHttpClient client = HttpClients.createDefault();
        CloseableHttpResponse response = client.execute(htpg);
        BufferedHttpEntity entity = new BufferedHttpEntity(response.getEntity());

        assertEquals(exp, EntityUtils.toString(entity));

        if (response != null) {
            response.close();
        }

    }

    @Test
    public void testInvalidURL_MultFuncs() throws Exception {

        String exp = "The URL contains invalid parameters!\n" +
                "Here is a list:\n" +
                "There were multiple parameters found that indicate which function to use!\n";

        URI uri = null;
        uri = new URIBuilder()
                .setScheme(scheme)
                .setHost(host)
                .setPort(port)
                .setPath(path)
                .addParameter("func", "getDimensions")
                .addParameter("func", "execute")
                .build();

        HttpGet htpg = new HttpGet(uri);
        //htpg.addHeader("Accept", format.mimeType);
        CloseableHttpClient client = HttpClients.createDefault();
        CloseableHttpResponse response = client.execute(htpg);
        BufferedHttpEntity entity = new BufferedHttpEntity(response.getEntity());

        assertEquals(exp, EntityUtils.toString(entity));

        if (response != null) {
            response.close();
        }

    }

    @Test
    public void testInvalidURL_MultInvalidFuncs() throws Exception {

        String exp = "The URL contains invalid parameters!\n" +
                "Here is a list:\n" +
                "Unknown Function: 'getDimension'\n" +
                "Unknown Function: 'someFunc'\n" +
                "There were multiple parameters found that indicate which function to use!\n";

        URI uri = null;
        uri = new URIBuilder()
                .setScheme(scheme)
                .setHost(host)
                .setPort(port)
                .setPath(path)
                .addParameter("func", "getDimension")
                .addParameter("func", "someFunc")
                .build();

        HttpGet htpg = new HttpGet(uri);
        //htpg.addHeader("Accept", format.mimeType);
        CloseableHttpClient client = HttpClients.createDefault();
        CloseableHttpResponse response = client.execute(htpg);
        BufferedHttpEntity entity = new BufferedHttpEntity(response.getEntity());

        assertEquals(exp, EntityUtils.toString(entity));

        if (response != null) {
            response.close();
        }

    }

    @Test
    public void testInvalidURL_MultFuncsOneInvalid() throws Exception {

        String exp = "The URL contains invalid parameters!\n" +
                "Here is a list:\n" +
                "Unknown Function: 'someFunc'\n" +
                "There were multiple parameters found that indicate which function to use!\n";

        URI uri = null;
        uri = new URIBuilder()
                .setScheme(scheme)
                .setHost(host)
                .setPort(port)
                .setPath(path)
                .addParameter("func", "getDimensions")
                .addParameter("func", "someFunc")
                .build();

        HttpGet htpg = new HttpGet(uri);
        //htpg.addHeader("Accept", format.mimeType);
        CloseableHttpClient client = HttpClients.createDefault();
        CloseableHttpResponse response = client.execute(htpg);
        BufferedHttpEntity entity = new BufferedHttpEntity(response.getEntity());

        assertEquals(exp, EntityUtils.toString(entity));

        if (response != null) {
            response.close();
        }

    }

    @Test
    public void testInvalidURL_InvalidParam() throws Exception {

        String exp = "The URL contains invalid parameters!\n" +
                "Here is a list:\n" +
                "Invaid parameter: 'someParam'\n";

        URI uri = null;
        uri = new URIBuilder()
                .setScheme(scheme)
                .setHost(host)
                .setPort(port)
                .setPath(path)
                .addParameter("func", "getDimensions")
                .addParameter("someParam", "someValue")
                .build();

        HttpGet htpg = new HttpGet(uri);
        //htpg.addHeader("Accept", format.mimeType);
        CloseableHttpClient client = HttpClients.createDefault();
        CloseableHttpResponse response = client.execute(htpg);
        BufferedHttpEntity entity = new BufferedHttpEntity(response.getEntity());

        assertEquals(exp, EntityUtils.toString(entity));

        if (response != null) {
            response.close();
        }

    }

    @Test
    public void testInvalidURL_MultInvalidParams() throws Exception {

        String exp = "The URL contains invalid parameters!\n" +
                "Here is a list:\n" +
                "Invaid parameter: 'someParam'\n" +
                "Invaid parameter: 'anotherParam'\n";

        URI uri = null;
        uri = new URIBuilder()
                .setScheme(scheme)
                .setHost(host)
                .setPort(port)
                .setPath(path)
                .addParameter("func", "getDimensions")
                .addParameter("someParam", "someValue")
                .addParameter("anotherParam", "anotherValue")
                .build();

        HttpGet htpg = new HttpGet(uri);
        //htpg.addHeader("Accept", format.mimeType);
        CloseableHttpClient client = HttpClients.createDefault();
        CloseableHttpResponse response = client.execute(htpg);
        BufferedHttpEntity entity = new BufferedHttpEntity(response.getEntity());

        assertEquals(exp, EntityUtils.toString(entity));

        if (response != null) {
            response.close();
        }

    }
}
