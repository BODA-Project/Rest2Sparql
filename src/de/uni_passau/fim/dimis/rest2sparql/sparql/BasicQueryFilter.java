package de.uni_passau.fim.dimis.rest2sparql.sparql;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/22/13
 * Time: 6:48 PM
 * To change this template use File | Settings | File Templates.
 */
public class BasicQueryFilter extends QueryFilter {

    private String filterURL;

    public BasicQueryFilter(FilterType type, String filterURL) {
        super(type);
        this.filterURL = filterURL;
    }

    @Override
    public String GenerateQueryFilter(String VariableName) {
        return "?" + VariableName + " = <" + filterURL + ">";
    }

}
