package de.uni_passau.fim.dimis.rest2sparql.cubemanagement;

import de.uni_passau.fim.dimis.rest2sparql.triplestore.CodeBigdataEngine;
import de.uni_passau.fim.dimis.rest2sparql.util.Cube;
import de.uni_passau.fim.dimis.rest2sparql.util.Dimension;
import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/23/13
 * Time: 4:09 PM
 * To change this template use File | Settings | File Templates.
 */
public class CubeManagerTest {
    @Test
    public void testGetCubes() throws Exception {

        CubeManager manager = new CubeManager(new CodeBigdataEngine());

        String res = manager.getCubes();

        assertTrue(res.length() > 1000);
        assertTrue(res.contains("Dataset-f744647d-e493-4640-9bd6-2080779a5e77"));

    }

    @Test
    public void testGetDimensions() throws Exception {

        String expected = "<?xml version='1.0' encoding='UTF-8'?>\n<sparql xmlns='http://www.w3.org/2005/sparql-results#'>\n\t<head>\n\t\t<variable name='CUBE_NAME'/>\n\t\t<variable name='DIMENSION_NAME'/>\n\t\t<variable name='LABEL'/>\n\t</head>\n\t<results>\n\t\t<result>\n\t\t\t<binding name='CUBE_NAME'>\n\t\t\t\t<uri>http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77</uri>\n\t\t\t</binding>\n\t\t\t<binding name='DIMENSION_NAME'>\n\t\t\t\t<uri>http://dbpedia.org/resource/Timestamp</uri>\n\t\t\t</binding>\n\t\t\t<binding name='LABEL'>\n\t\t\t\t<literal xml:lang='en'>Timestamp</literal>\n\t\t\t</binding>\n\t\t</result>\n\t\t<result>\n\t\t\t<binding name='CUBE_NAME'>\n\t\t\t\t<uri>http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77</uri>\n\t\t\t</binding>\n\t\t\t<binding name='DIMENSION_NAME'>\n\t\t\t\t<uri>http://dbpedia.org/resource/Timestamp</uri>\n\t\t\t</binding>\n\t\t\t<binding name='LABEL'>\n\t\t\t\t<literal>Timestamp</literal>\n\t\t\t</binding>\n\t\t</result>\n\t\t<result>\n\t\t\t<binding name='CUBE_NAME'>\n\t\t\t\t<uri>http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77</uri>\n\t\t\t</binding>\n\t\t\t<binding name='DIMENSION_NAME'>\n\t\t\t\t<uri>http://dbpedia.org/resource/River</uri>\n\t\t\t</binding>\n\t\t\t<binding name='LABEL'>\n\t\t\t\t<literal xml:lang='en'>River</literal>\n\t\t\t</binding>\n\t\t</result>\n\t\t<result>\n\t\t\t<binding name='CUBE_NAME'>\n\t\t\t\t<uri>http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77</uri>\n\t\t\t</binding>\n\t\t\t<binding name='DIMENSION_NAME'>\n\t\t\t\t<uri>http://dbpedia.org/resource/River</uri>\n\t\t\t</binding>\n\t\t\t<binding name='LABEL'>\n\t\t\t\t<literal>River</literal>\n\t\t\t</binding>\n\t\t</result>\n\t</results>\n</sparql>\n";

        CubeManager manager = new CubeManager(new CodeBigdataEngine());

        String res = manager.getDimensions(new Cube("http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77"));

        assertEquals(expected, res);
    }

    @Test
    public void testGetMeasures() throws Exception {
        String expected = "<?xml version='1.0' encoding='UTF-8'?>\n<sparql xmlns='http://www.w3.org/2005/sparql-results#'>\n\t<head>\n\t\t<variable name='CUBE_NAME'/>\n\t\t<variable name='MEASURE_NAME'/>\n\t\t<variable name='LABEL'/>\n\t</head>\n\t<results>\n\t\t<result>\n\t\t\t<binding name='CUBE_NAME'>\n\t\t\t\t<uri>http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77</uri>\n\t\t\t</binding>\n\t\t\t<binding name='MEASURE_NAME'>\n\t\t\t\t<uri>http://dbpedia.org/resource/Water_level</uri>\n\t\t\t</binding>\n\t\t\t<binding name='LABEL'>\n\t\t\t\t<literal xml:lang='en'>Water level</literal>\n\t\t\t</binding>\n\t\t</result>\n\t\t<result>\n\t\t\t<binding name='CUBE_NAME'>\n\t\t\t\t<uri>http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77</uri>\n\t\t\t</binding>\n\t\t\t<binding name='MEASURE_NAME'>\n\t\t\t\t<uri>http://dbpedia.org/resource/Water_level</uri>\n\t\t\t</binding>\n\t\t\t<binding name='LABEL'>\n\t\t\t\t<literal>Water Level</literal>\n\t\t\t</binding>\n\t\t</result>\n\t</results>\n</sparql>\n";

        CubeManager manager = new CubeManager(new CodeBigdataEngine());

        String res = manager.getMeasures(new Cube("http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77"));

        assertEquals(expected, res);
    }

    @Test
    public void testGetEntities() throws Exception {
        String expected = "<?xml version='1.0' encoding='UTF-8'?>\n<sparql xmlns='http://www.w3.org/2005/sparql-results#'>\n\t<head>\n\t\t<variable name='CUBE_NAME'/>\n\t\t<variable name='DIMENSION_NAME'/>\n\t\t<variable name='ENTITY_NAME'/>\n\t\t<variable name='LABEL'/>\n\t</head>\n\t<results>\n\t\t<result>\n\t\t\t<binding name='CUBE_NAME'>\n\t\t\t\t<uri>http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77</uri>\n\t\t\t</binding>\n\t\t\t<binding name='DIMENSION_NAME'>\n\t\t\t\t<uri>http://dbpedia.org/resource/River</uri>\n\t\t\t</binding>\n\t\t\t<binding name='ENTITY_NAME'>\n\t\t\t\t<uri>http://code-research.eu/resource/Entity_aed8cf79-ce59-4978-8259-8c9eed48889f</uri>\n\t\t\t</binding>\n\t\t\t<binding name='LABEL'>\n\t\t\t\t<literal datatype='http://www.w3.org/2001/XMLSchema#string'>Donau</literal>\n\t\t\t</binding>\n\t\t</result>\n\t</results>\n</sparql>\n";

        CubeManager manager = new CubeManager(new CodeBigdataEngine());

        String res = manager.getEntities(new Dimension("http://dbpedia.org/resource/River"),
                new Cube("http://code-research.eu/resource/Dataset-f744647d-e493-4640-9bd6-2080779a5e77"));

        assertEquals(expected, res);
    }
}
