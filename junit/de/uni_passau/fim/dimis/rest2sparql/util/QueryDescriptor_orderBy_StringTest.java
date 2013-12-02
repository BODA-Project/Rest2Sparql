package de.uni_passau.fim.dimis.rest2sparql.util;

import de.uni_passau.fim.dimis.rest2sparql.queryfactory.QueryDescriptor;
import junit.framework.Assert;
import org.junit.Test;

import java.util.LinkedList;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 11/7/13
 * Time: 1:37 PM
 * To change this template use File | Settings | File Templates.
 */
public class QueryDescriptor_orderBy_StringTest {
    @Test
    public void testOrderByString_normal() throws Exception {

        LinkedList<CubeObject> lst = new LinkedList<>();

        CubeObject co1 = new Cube("someCube", new Parameters(true, 1, true, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null));
        CubeObject co2 = new Dimension("someDim", new Parameters(true, 2, true, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null));
        CubeObject co3 = new Measure("someMeasure", new Parameters(true, 3, true, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null));

        co1.setVarName("CUBE", false);
        co2.setVarName("DIM", false);
        co3.setVarName("MEAS", false);

        lst.add(co1);
        lst.add(co2);
        lst.add(co3);

        QueryDescriptor qd = new QueryDescriptor(lst);
        String exp = "ORDER BY ?CUBE ?DIM ?MEAS ";
        Assert.assertEquals(exp, qd.orderByString());
    }

    @Test
    public void testOrderByString_differentOrder() throws Exception {

        LinkedList<CubeObject> lst = new LinkedList<>();

        CubeObject co1 = new Cube("someCube", new Parameters(true, 2, true, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null));
        CubeObject co2 = new Dimension("someDim", new Parameters(true, 1, true, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null));
        CubeObject co3 = new Measure("someMeasure", new Parameters(true, 3, true, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null));

        co1.setVarName("CUBE", false);
        co2.setVarName("DIM", false);
        co3.setVarName("MEAS", false);

        lst.add(co1);
        lst.add(co2);
        lst.add(co3);

        QueryDescriptor qd = new QueryDescriptor(lst);
        String exp = "ORDER BY ?DIM ?CUBE ?MEAS ";
        Assert.assertEquals(exp, qd.orderByString());
    }

    @Test
    public void testOrderByString_holes() throws Exception {

        LinkedList<CubeObject> lst = new LinkedList<>();

        CubeObject co1 = new Cube("someCube", new Parameters(true, 7, true, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null));
        CubeObject co2 = new Dimension("someDim", new Parameters(true, 5, true, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null));
        CubeObject co3 = new Measure("someMeasure", new Parameters(true, 3, true, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null));

        co1.setVarName("CUBE", false);
        co2.setVarName("DIM", false);
        co3.setVarName("MEAS", false);

        lst.add(co1);
        lst.add(co2);
        lst.add(co3);

        QueryDescriptor qd = new QueryDescriptor(lst);
        String exp = "ORDER BY ?MEAS ?DIM ?CUBE ";
        Assert.assertEquals(exp, qd.orderByString());
    }

    @Test
    public void testOrderByString_double() throws Exception {

        LinkedList<CubeObject> lst = new LinkedList<>();

        CubeObject co1 = new Cube("someCube", new Parameters(true, 1, true, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null));
        CubeObject co2 = new Dimension("someDim", new Parameters(true, 2, true, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null));
        CubeObject co3 = new Measure("someMeasure", new Parameters(true, 2, true, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null));
        CubeObject co4 = new Measure("someMeasure1", new Parameters(true, 3, true, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null, Parameters.AggregateFunction.NONE, Parameters.Relation.NONE, null));


        co1.setVarName("CUBE", false);
        co2.setVarName("DIM", false);
        co3.setVarName("MEAS1", false);
        co4.setVarName("MEAS", false);

        lst.add(co1);
        lst.add(co2);
        lst.add(co3);
        lst.add(co4);

        QueryDescriptor qd = new QueryDescriptor(lst);
        String exp = "ORDER BY ?CUBE ?MEAS1 ?DIM ?MEAS ";
        Assert.assertEquals(exp, qd.orderByString());
    }
}
