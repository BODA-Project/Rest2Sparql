package de.uni_passau.fim.dimis.rest2sparql.util;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/30/13
 * Time: 4:06 PM
 * To change this template use File | Settings | File Templates.
 */
public class Cube extends CubeObject {
    public Cube(String name) {
        super(name);
        VAR_NAME_PREFIX = "C_";
    }

    //public Cube(String name, SparqlPrefix prefix) {
    //    super(name, prefix);
    //    VAR_NAME_PREFIX = "C_";
    //}

    @Override
    public String buildPattern(String obsNameVar) {
        return null;
    }
}
