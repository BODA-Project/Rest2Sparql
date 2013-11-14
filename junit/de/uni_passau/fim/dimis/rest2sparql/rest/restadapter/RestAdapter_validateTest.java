package de.uni_passau.fim.dimis.rest2sparql.rest.restadapter;

import de.uni_passau.fim.dimis.rest2sparql.util.Cube;
import de.uni_passau.fim.dimis.rest2sparql.util.CubeObject;
import de.uni_passau.fim.dimis.rest2sparql.util.Dimension;
import de.uni_passau.fim.dimis.rest2sparql.util.Measure;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;

import java.util.LinkedList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 11/1/13
 * Time: 2:46 PM
 */
public class RestAdapter_validateTest {

    private static RestAdapter adapter;

    @BeforeClass
    public static void beforeClass() {
        adapter = new RestAdapter();
    }

    @Test
    public void testValidateMethodParams_getCubes() throws Exception {

        List<CubeObject> lst = new LinkedList<>();

        String res = adapter.validateMethodParams(Methods.GET_CUBES, lst);
        Assert.assertEquals("", res);

        lst.add(new Dimension("someDim"));
        res = adapter.validateMethodParams(Methods.GET_CUBES, lst);
        Assert.assertEquals("This method does not take any parameters.", res);

    }

    @Test
    public void testValidateMethodParams_execute() throws Exception {

        List<CubeObject> lst = new LinkedList<>();

        String res = adapter.validateMethodParams(Methods.EXECUTE, lst);
        Assert.assertEquals("There were no parameters found. This function takes any number (> 0) and type of parameters.", res);

        lst.add(new Dimension("someDim"));
        res = adapter.validateMethodParams(Methods.EXECUTE, lst);
        Assert.assertEquals("There has to be exactly one 'cube' parameter.", res);

        lst.add(new Cube("someCube"));
        lst.add(new Measure("someMeasure"));
        lst.add(new Dimension("someOtherDim"));
        res = adapter.validateMethodParams(Methods.EXECUTE, lst);
        Assert.assertEquals("", res);
    }

    @Test
    public void testValidateMethodParams_getMeasureOrDimension() throws Exception {

        List<CubeObject> lst = new LinkedList<>();

        String res = adapter.validateMethodParams(Methods.GET_MEASURES, lst);
        Assert.assertEquals("This method takes exactly one parameter.", res);

        lst.add(new Dimension("someDim"));
        res = adapter.validateMethodParams(Methods.GET_MEASURES, lst);
        Assert.assertEquals("The parameter has to be of the type 'cube'.", res);

        lst.add(new Cube("someCube"));
        lst.add(new Measure("someMeasure"));
        lst.add(new Dimension("someOtherDim"));
        res = adapter.validateMethodParams(Methods.GET_MEASURES, lst);
        Assert.assertEquals("This method takes exactly one parameter.", res);

        lst.clear();
        lst.add(new Cube("someCube"));
        res = adapter.validateMethodParams(Methods.GET_MEASURES, lst);
        Assert.assertEquals("", res);
    }

    @Test
    public void testValidateMethodParams_getEntities() throws Exception {

        List<CubeObject> lst = new LinkedList<>();

        String res = adapter.validateMethodParams(Methods.GET_ENTITIES, lst);
        Assert.assertEquals("This method takes exactly two parameters.", res);

        lst.clear();
        lst.add(new Cube("someCube"));
        res = adapter.validateMethodParams(Methods.GET_ENTITIES, lst);
        Assert.assertEquals("This method takes exactly two parameters.", res);

        lst.add(new Dimension("someDim"));
        res = adapter.validateMethodParams(Methods.GET_ENTITIES, lst);
        Assert.assertEquals("", res);

        lst.clear();
        lst.add(new Dimension("someDim"));
        lst.add(new Cube("someCube"));
        res = adapter.validateMethodParams(Methods.GET_ENTITIES, lst);
        Assert.assertEquals("", res);

        lst.clear();
        lst.add(new Cube("someCube"));
        lst.add(new Measure("someMeasure"));
        res = adapter.validateMethodParams(Methods.GET_ENTITIES, lst);
        Assert.assertEquals("The parameters have to be of the type 'cube' and 'dimension'.", res);

        lst.clear();
        lst.add(new Measure("someMeasure"));
        lst.add(new Dimension("someDim"));
        res = adapter.validateMethodParams(Methods.GET_ENTITIES, lst);
        Assert.assertEquals("The parameters have to be of the type 'cube' and 'dimension'.", res);

        lst.clear();
        lst.add(new Measure("someMeasure"));
        lst.add(new Measure("someMeasure"));
        res = adapter.validateMethodParams(Methods.GET_ENTITIES, lst);
        Assert.assertEquals("The parameters have to be of the type 'cube' and 'dimension'.", res);

        lst.add(new Cube("someCube"));
        res = adapter.validateMethodParams(Methods.GET_ENTITIES, lst);
        Assert.assertEquals("This method takes exactly two parameters.", res);


    }
}
