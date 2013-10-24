package de.uni_passau.fim.dimis.rest2sparql.queryfactory;

import de.uni_passau.fim.dimis.rest2sparql.util.CubeObject;
import de.uni_passau.fim.dimis.rest2sparql.util.Dimension;
import de.uni_passau.fim.dimis.rest2sparql.util.Measure;
import junit.framework.Assert;
import org.junit.Test;

import java.util.LinkedList;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/24/13
 * Time: 1:08 PM
 * To change this template use File | Settings | File Templates.
 */
public class QueryFactoryTest {
    @Test
    public void testBuildObservationQuery() throws Exception {

        String exp = "PREFIX code: <http://code-research.eu/resource/> PREFIX qb: <http://purl.org/linked-data/cube#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT ?OBS_NAME ?CUBE_NAME ?D_NAME_0 ?E_NAME_0 ?D_NAME_1 ?E_NAME_1 ?M_NAME_2 ?V_NAME_2 WHERE { ?OBS_NAME a qb:Observation. ?OBS_NAME ?D_NAME_0 ?E_NAME_0. ?OBS_NAME ?D_NAME_1 ?E_NAME_1. ?OBS_NAME ?M_NAME_2 ?V_NAME_2. ?OBS_NAME qb:dataSet ?CUBE_NAME. FILTER (?CUBE_NAME = code:Dataset-f744647d-e493-4640-9bd6-2080779a5e77). FILTER (?D_NAME_0 = <http://dbpedia.org/resource/Timestamp>). FILTER (?D_NAME_1 = <http://dbpedia.org/resource/River>). FILTER (?M_NAME_2 = <http://dbpedia.org/resource/Water_level>). }";

        LinkedList<CubeObject> objects = new LinkedList<>();
        Dimension d1 = new Dimension("Label", "http://dbpedia.org/resource/Timestamp");
        Dimension d2 = new Dimension("Label", "http://dbpedia.org/resource/River");
        Measure m1 = new Measure("Label", "http://dbpedia.org/resource/Water_level");
        objects.add(d1);
        objects.add(d2);
        objects.add(m1);

        QueryFactory f = new QueryFactory();
        String res = f.buildObservationQuery("Dataset-f744647d-e493-4640-9bd6-2080779a5e77", objects);
        Assert.assertEquals(exp, res);

    }
}
