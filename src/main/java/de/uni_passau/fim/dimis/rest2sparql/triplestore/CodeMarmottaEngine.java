package de.uni_passau.fim.dimis.rest2sparql.triplestore;

import de.uni_passau.fim.dimis.rest2sparql.triplestore.util.ConnectionException;
import de.uni_passau.fim.dimis.rest2sparql.triplestore.util.QueryException;
import org.apache.http.Consts;
import org.apache.http.HttpEntity;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.BufferedHttpEntity;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

public class CodeMarmottaEngine extends CodeEngine {

    private static final String scheme = "http";
    private static final String path = "/marmotta/sparql/select";


    public CodeMarmottaEngine(String host, int port) {
        super(host, port);
    }

    @Deprecated
    public CodeMarmottaEngine() {
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
                    .addParameter("output", output_format)
                    .build();
        } catch (URISyntaxException e) {
            throw new QueryException("Your query broke the URIBuilder!");
        }

        HttpPost htpp = new HttpPost(uri);
        CloseableHttpClient client = HttpClients.createDefault();
        CloseableHttpResponse response = null;
        BufferedHttpEntity entity = null;

        HttpEntity request = new StringEntity(query, ContentType.create("text/plain", Consts.UTF_8));

        try {
            htpp.setEntity(request);
            response = client.execute(htpp);
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
