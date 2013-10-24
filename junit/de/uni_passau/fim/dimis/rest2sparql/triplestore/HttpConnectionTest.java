package de.uni_passau.fim.dimis.rest2sparql.triplestore;

import org.junit.Assert;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/22/13
 * Time: 12:16 PM
 * To change this template use File | Settings | File Templates.
 */
public class HttpConnectionTest {
    @org.junit.Test
    public void testExecuteSPARQL() throws Exception {

        String query = "PREFIX qb: <http://purl.org/linked-data/cube#> " +
                "PREFIX code: <http://code-research.eu/resource/> " +
                "SELECT ?CUBE_NAME " +
                "WHERE { ?CUBE_NAME a qb:DataSet. " +
                "FILTER (?CUBE_NAME = code:Dataset-280). }";

        String expected = "<?xml version='1.0' encoding='UTF-8'?>\n" +
                "<sparql xmlns='http://www.w3.org/2005/sparql-results#'>\n" +
                "\t<head>\n" +
                "\t\t<variable name='CUBE_NAME'/>\n" +
                "\t</head>\n" +
                "\t<results>\n" +
                "\t\t<result>\n" +
                "\t\t\t<binding name='CUBE_NAME'>\n" +
                "\t\t\t\t<uri>http://code-research.eu/resource/Dataset-280</uri>\n" +
                "\t\t\t</binding>\n" +
                "\t\t</result>\n" +
                "\t</results>\n" +
                "</sparql>\n";

        CodeBigdataEngine con = new CodeBigdataEngine();
        String res = con.ExecuteSPARQL(query, TripleStoreConnection.OutputFormat.XML);

        Assert.assertEquals(res, expected);

    }
}
