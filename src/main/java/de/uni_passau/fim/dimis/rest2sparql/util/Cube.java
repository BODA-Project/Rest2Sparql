package de.uni_passau.fim.dimis.rest2sparql.util;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/30/13
 * Time: 4:06 PM
 */
public class Cube extends CubeObject {
    public Cube(String name, Parameters p) {
        super(name, p);
        VAR_NAME_PREFIX = "C_";
    }

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

    @Override
    public String buildSelectToken() {

        if (params.aggregate == Parameters.AggregateFunction.NONE) {
            StringBuilder sb = new StringBuilder();
            for (String s : this.getAllVarNames()) {
                sb.append('?');
                sb.append(s);
                sb.append(' ');
            }
            return sb.toString();
        } else {
            return super.buildSelectTokenHelper(getVarName(), getVarName() + "_AGG");
        }

    }

    @Override
    public String buildHavingToken() {
        return super.buildHavingTokenHelper(getVarName());
    }
}