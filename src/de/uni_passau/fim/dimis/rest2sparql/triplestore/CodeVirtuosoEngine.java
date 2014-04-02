package de.uni_passau.fim.dimis.rest2sparql.triplestore;

import de.uni_passau.fim.dimis.rest2sparql.triplestore.util.ConnectionException;
import de.uni_passau.fim.dimis.rest2sparql.triplestore.util.QueryException;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.BufferedHttpEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

public class CodeVirtuosoEngine extends CodeEngine {

    private static final String scheme = "http";
    private static final String path = "/sparql";
    private static final String param1 = "query";


    public CodeVirtuosoEngine(String host, int port) {
        super(host, port);
    }

    @Deprecated
    public CodeVirtuosoEngine() {
    }

    public String executeSPARQL(String query, OutputFormat format) throws ConnectionException {

        String output_format = "xml";
        if (format == OutputFormat.JSON) {
            output_format = "json";
        }

        URI uri;
        try {
            uri = new URIBuilder()
                    .setScheme(scheme)
                    .setHost(host)
                    .setPort(port)
                    .setPath(path)
                    .setParameter(param1, query)
                    .setParameter("format", output_format)
                    .build();
        } catch (URISyntaxException e) {
            throw new QueryException("Your query broke the URIBuilder!");
        }

        HttpGet htpg = new HttpGet(uri);
        //htpg.addHeader("Accept", format.mimeType);
        CloseableHttpClient client = HttpClients.createDefault();
        CloseableHttpResponse response = null;
        BufferedHttpEntity entity = null;
        try {
            response = client.execute(htpg);
            entity = new BufferedHttpEntity(response.getEntity());
        } catch (ClientProtocolException e) {
            System.out.println("shit!"); // TODO
        } catch (IOException e) {
            throw new ConnectionException(e);
        } finally {
            if (response != null) {
                try {
                    response.close();
                } catch (IOException e) {
                }
            }
        }

        try {
            return EntityUtils.toString(entity);
        } catch (IOException e) {
            throw new ConnectionException(e);
        }
    }

}
