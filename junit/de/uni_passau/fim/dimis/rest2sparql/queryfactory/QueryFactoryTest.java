package de.uni_passau.fim.dimis.rest2sparql.queryfactory;

import de.uni_passau.fim.dimis.rest2sparql.util.*;
import junit.framework.Assert;
import org.junit.Test;

import java.util.LinkedList;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/24/13
 * Time: 1:08 PM
 */
public class QueryFactoryTest {
    @Test
    public void testBuildObservationQuery() throws Exception {

        String exp = "PREFIX qb: <http://purl.org/linked-data/cube#> PREFIX code: <http://code-research.eu/resource/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT ?OBS_NAME ?CUBE_NAME ?D_NAME_0 ?E_NAME_0 ?D_NAME_1 ?E_NAME_1 ?M_NAME_2 ?V_NAME_2 WHERE { ?OBS_NAME a qb:Observation. ?OBS_NAME ?D_NAME_0 ?E_NAME_0. ?OBS_NAME ?D_NAME_1 ?E_NAME_1. ?OBS_NAME ?M_NAME_2 ?V_NAME_2. ?OBS_NAME qb:dataSet ?CUBE_NAME. FILTER (?CUBE_NAME = code:Dataset-f744647d-e493-4640-9bd6-2080779a5e77). FILTER (?D_NAME_0 = <http://dbpedia.org/resource/Timestamp>). FILTER (?D_NAME_1 = <http://dbpedia.org/resource/River>). FILTER (?M_NAME_2 = <http://dbpedia.org/resource/Water_level>). }";

        LinkedList<CubeObject> objects = new LinkedList<>();
        Dimension d1 = new Dimension("http://dbpedia.org/resource/Timestamp");
        Dimension d2 = new Dimension("http://dbpedia.org/resource/River");
        Measure m1 = new Measure("http://dbpedia.org/resource/Water_level");
        objects.add(d1);
        objects.add(d2);
        objects.add(m1);

        String res = QueryFactory.buildObservationQuery("Dataset-f744647d-e493-4640-9bd6-2080779a5e77", objects);
        Assert.assertEquals(exp, res);

    }

    @Test
    public void testBuildObservationQuery_2() throws Exception {

        String exp = "PREFIX qb: <http://purl.org/linked-data/cube#> PREFIX code: <http://code-research.eu/resource/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT ?OBS_NAME ?D_NAME_0 ?E_NAME_0 ?D_NAME_1 ?E_NAME_1 ?M_NAME_2 ?V_NAME_2 ?C_NAME_3 WHERE { ?OBS_NAME a qb:Observation. ?OBS_NAME ?D_NAME_0 ?E_NAME_0. ?OBS_NAME ?D_NAME_1 ?E_NAME_1. ?OBS_NAME ?M_NAME_2 ?V_NAME_2. ?OBS_NAME qb:dataSet ?C_NAME_3. FILTER (?D_NAME_0 = <http://dbpedia.org/resource/Timestamp>). FILTER (?D_NAME_1 = <http://dbpedia.org/resource/River>). FILTER (?M_NAME_2 = <http://dbpedia.org/resource/Water_level>). FILTER (?C_NAME_3 = <http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77>). }";

        LinkedList<CubeObject> objects = new LinkedList<>();
        Dimension d1 = new Dimension("http://dbpedia.org/resource/Timestamp");
        Dimension d2 = new Dimension("http://dbpedia.org/resource/River");
        Measure m1 = new Measure("http://dbpedia.org/resource/Water_level");
        objects.add(d1);
        objects.add(d2);
        objects.add(m1);
        objects.add(new Cube("http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77"));

        String res = QueryFactory.buildObservationQuery(objects);
        Assert.assertEquals(exp, res);

    }

    @Test
    public void testBuildObservationQuery_3() throws Exception {

        String exp = "PREFIX qb: <http://purl.org/linked-data/cube#> PREFIX code: <http://code-research.eu/resource/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT ?D_NAME_0 ?E_NAME_0 ?D_NAME_1 ?E_NAME_1 ?M_NAME_2 ?V_NAME_2 ?OBS_NAME WHERE { ?OBS_NAME a qb:Observation. ?OBS_NAME ?D_NAME_0 ?E_NAME_0. ?OBS_NAME ?D_NAME_1 ?E_NAME_1. ?OBS_NAME ?M_NAME_2 ?V_NAME_2. ?OBS_NAME qb:dataSet ?C_NAME_3. FILTER (?D_NAME_0 = <http://dbpedia.org/resource/Timestamp>). FILTER (?D_NAME_1 = <http://dbpedia.org/resource/River>). FILTER (?M_NAME_2 = <http://dbpedia.org/resource/Water_level>). FILTER (?V_NAME_2 > \"1000\"). FILTER (?C_NAME_3 = <http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77>). } GROUP BY ?D_NAME_1 ORDER BY ?D_NAME_0 LIMIT 100";

        LinkedList<CubeObject> objects = new LinkedList<>();
        Dimension d1 = new Dimension("http://dbpedia.org/resource/Timestamp", new Parameters(true, 1, false, null, null, null, null, null, null));
        Dimension d2 = new Dimension("http://dbpedia.org/resource/River", new Parameters(true, 0, true, null, null, null, null, null, null));
        Measure m1 = new Measure("http://dbpedia.org/resource/Water_level", new Parameters(true, 0, false, null, Parameters.Relation.BIGGER, "1000", null, null, null));
        objects.add(d1);
        objects.add(d2);
        objects.add(m1);
        objects.add(new Cube("http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77", new Parameters(false, 0, false, null, null, null, null, null, null)));

        String res = QueryFactory.buildObservationQuery(new QueryDescriptor(objects, 100));
        Assert.assertEquals(exp, res);

    }
}
