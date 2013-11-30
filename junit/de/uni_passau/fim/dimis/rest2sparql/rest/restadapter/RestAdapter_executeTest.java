package de.uni_passau.fim.dimis.rest2sparql.rest.restadapter;

import de.uni_passau.fim.dimis.rest2sparql.triplestore.ITripleStoreConnection;
import de.uni_passau.fim.dimis.rest2sparql.triplestore.util.ConnectionException;
import de.uni_passau.fim.dimis.rest2sparql.util.Cube;
import de.uni_passau.fim.dimis.rest2sparql.util.CubeObject;
import de.uni_passau.fim.dimis.rest2sparql.util.Dimension;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 11/3/13
 * Time: 12:23 PM
 */
public class RestAdapter_executeTest {

    private static ITripleStoreConnection badConn;
    private static RestAdapter goodAdapter, badAdapter;
    @Rule
    public ExpectedException exception = ExpectedException.none();

    @BeforeClass
    public static void setUpBeforeClass() throws Exception {

        badConn = new BadConn();

        goodAdapter = new RestAdapter();
        badAdapter = new RestAdapter(badConn);

    }

    @Test
    public void testExecute_methodBad() throws Exception {

        String exp = "A problem occurred while connecting to the SPARQL Backend.\n" +
                "It was caused by the following Exception:\n" +
                "java.io.IOException: This is an IOException\n";

        String res = badAdapter.execute(Methods.GET_CUBES);
        assertEquals(exp, res.substring(0, exp.length()));

    }

    @Test
    public void testExecute_methodGetCubes() throws Exception {

        String res = goodAdapter.execute(Methods.GET_CUBES);

        assertTrue(res.length() > 1000);
        assertTrue(!res.contains("Exception"));
        assertTrue(res.contains("Dataset-f744647d-e493-4640-9bd6-2080779a5e77"));

    }

    @Test
    public void testExecute_methodBadMethod() throws Exception {

        exception.expect(UnknownMethodException.class);
        goodAdapter.execute(Methods.GET_MEASURES);

    }

    @Test
    public void testExecute_methodAndParams() throws Exception {

        String expDim = "<?xml version='1.0' encoding='UTF-8'?>\n<sparql xmlns='http://www.w3.org/2005/sparql-results#'>\n\t<head>\n\t\t<variable name='CUBE_NAME'/>\n\t\t<variable name='DIMENSION_NAME'/>\n\t\t<variable name='LABEL'/>\n\t</head>\n\t<results>\n\t\t<result>\n\t\t\t<binding name='CUBE_NAME'>\n\t\t\t\t<uri>http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77</uri>\n\t\t\t</binding>\n\t\t\t<binding name='DIMENSION_NAME'>\n\t\t\t\t<uri>http://dbpedia.org/resource/Timestamp</uri>\n\t\t\t</binding>\n\t\t\t<binding name='LABEL'>\n\t\t\t\t<literal xml:lang='en'>Timestamp</literal>\n\t\t\t</binding>\n\t\t</result>\n\t\t<result>\n\t\t\t<binding name='CUBE_NAME'>\n\t\t\t\t<uri>http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77</uri>\n\t\t\t</binding>\n\t\t\t<binding name='DIMENSION_NAME'>\n\t\t\t\t<uri>http://dbpedia.org/resource/Timestamp</uri>\n\t\t\t</binding>\n\t\t\t<binding name='LABEL'>\n\t\t\t\t<literal>Timestamp</literal>\n\t\t\t</binding>\n\t\t</result>\n\t\t<result>\n\t\t\t<binding name='CUBE_NAME'>\n\t\t\t\t<uri>http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77</uri>\n\t\t\t</binding>\n\t\t\t<binding name='DIMENSION_NAME'>\n\t\t\t\t<uri>http://dbpedia.org/resource/River</uri>\n\t\t\t</binding>\n\t\t\t<binding name='LABEL'>\n\t\t\t\t<literal xml:lang='en'>River</literal>\n\t\t\t</binding>\n\t\t</result>\n\t\t<result>\n\t\t\t<binding name='CUBE_NAME'>\n\t\t\t\t<uri>http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77</uri>\n\t\t\t</binding>\n\t\t\t<binding name='DIMENSION_NAME'>\n\t\t\t\t<uri>http://dbpedia.org/resource/River</uri>\n\t\t\t</binding>\n\t\t\t<binding name='LABEL'>\n\t\t\t\t<literal>River</literal>\n\t\t\t</binding>\n\t\t</result>\n\t</results>\n</sparql>\n";
        String expMeas = "<?xml version='1.0' encoding='UTF-8'?>\n<sparql xmlns='http://www.w3.org/2005/sparql-results#'>\n\t<head>\n\t\t<variable name='CUBE_NAME'/>\n\t\t<variable name='MEASURE_NAME'/>\n\t\t<variable name='LABEL'/>\n\t</head>\n\t<results>\n\t\t<result>\n\t\t\t<binding name='CUBE_NAME'>\n\t\t\t\t<uri>http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77</uri>\n\t\t\t</binding>\n\t\t\t<binding name='MEASURE_NAME'>\n\t\t\t\t<uri>http://dbpedia.org/resource/Water_level</uri>\n\t\t\t</binding>\n\t\t\t<binding name='LABEL'>\n\t\t\t\t<literal xml:lang='en'>Water level</literal>\n\t\t\t</binding>\n\t\t</result>\n\t\t<result>\n\t\t\t<binding name='CUBE_NAME'>\n\t\t\t\t<uri>http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77</uri>\n\t\t\t</binding>\n\t\t\t<binding name='MEASURE_NAME'>\n\t\t\t\t<uri>http://dbpedia.org/resource/Water_level</uri>\n\t\t\t</binding>\n\t\t\t<binding name='LABEL'>\n\t\t\t\t<literal>Water Level</literal>\n\t\t\t</binding>\n\t\t</result>\n\t\t<result>\n\t\t\t<binding name='CUBE_NAME'>\n\t\t\t\t<uri>http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77</uri>\n\t\t\t</binding>\n\t\t\t<binding name='MEASURE_NAME'>\n\t\t\t\t<uri>http://dbpedia.org/resource/Water_level</uri>\n\t\t\t</binding>\n\t\t\t<binding name='LABEL'>\n\t\t\t\t<literal>\n                </literal>\n\t\t\t</binding>\n\t\t</result>\n\t</results>\n</sparql>\n";
        String expEnt = "<?xml version='1.0' encoding='UTF-8'?>\n<sparql xmlns='http://www.w3.org/2005/sparql-results#'>\n\t<head>\n\t\t<variable name='CUBE_NAME'/>\n\t\t<variable name='DIMENSION_NAME'/>\n\t\t<variable name='ENTITY_NAME'/>\n\t\t<variable name='LABEL'/>\n\t</head>\n\t<results>\n\t\t<result>\n\t\t\t<binding name='CUBE_NAME'>\n\t\t\t\t<uri>http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77</uri>\n\t\t\t</binding>\n\t\t\t<binding name='DIMENSION_NAME'>\n\t\t\t\t<uri>http://dbpedia.org/resource/River</uri>\n\t\t\t</binding>\n\t\t\t<binding name='ENTITY_NAME'>\n\t\t\t\t<uri>http://code-research.eu/resource/Entity_aed8cf79-ce59-4978-8259-8c9eed48889f</uri>\n\t\t\t</binding>\n\t\t\t<binding name='LABEL'>\n\t\t\t\t<literal datatype='http://www.w3.org/2001/XMLSchema#string'>Donau</literal>\n\t\t\t</binding>\n\t\t</result>\n\t</results>\n</sparql>\n";

        List<CubeObject> lst = new LinkedList<>();
        lst.add(new Cube("http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77"));

        assertEquals(expDim, goodAdapter.execute(Methods.GET_DIMENSIONS, lst));
        assertEquals(expMeas, goodAdapter.execute(Methods.GET_MEASURES, lst));

        lst.add(new Dimension("http://dbpedia.org/resource/River"));
        assertEquals(expEnt, goodAdapter.execute(Methods.GET_ENTITIES, lst));

    }

    private static class BadConn implements ITripleStoreConnection {

        @Override
        public String executeSPARQL(String query, OutputFormat format) throws ConnectionException {
            throw new ConnectionException(new IOException("This is an IOException"));
        }
    }
}
