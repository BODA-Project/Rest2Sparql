package de.uni_passau.fim.dimis.rest2sparql.triplestore;

import de.uni_passau.fim.dimis.rest2sparql.triplestore.util.QueryException;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.conn.HttpHostConnectException;
import org.apache.http.entity.BufferedHttpEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import java.net.URI;
import java.net.URISyntaxException;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/22/13
 * Time: 11:14 AM
 * To change this template use File | Settings | File Templates.
 */
public class CodeBigdataEngine implements ITripleStoreConnection {

    private static final String scheme = "http";
    private static final String host = "zaire.dimis.fim.uni-passau.de";
    private static final int port = 8181;
    private static final String path = "/bigdata/sparql";
    private static final String param1 = "query";

    public CodeBigdataEngine() {
    }

    public String executeSPARQL(String query, OutputFormat format) throws Exception {

        URI uri = null;
        try {
            uri = new URIBuilder()
                    .setScheme(scheme)
                    .setHost(host)
                    .setPort(port)
                    .setPath(path)
                    .setParameter(param1, query)
                    .build();
        } catch (URISyntaxException e) {
            throw new QueryException("Your query broke the URIBuilder!");
        }

        HttpGet htpg = new HttpGet(uri);
        htpg.addHeader("Accept", format.mimeType);
        CloseableHttpClient client = HttpClients.createDefault();
        CloseableHttpResponse response = null;
        BufferedHttpEntity entity = null;
        try {
            response = client.execute(htpg);
            entity = new BufferedHttpEntity(response.getEntity());
        } catch (ClientProtocolException e) {
            System.out.println("shit!"); // TODO
        } catch (HttpHostConnectException e) {
            throw e;
        } finally {
            if (response != null) {
                response.close();
            }
        }

        return EntityUtils.toString(entity);
    }

}
