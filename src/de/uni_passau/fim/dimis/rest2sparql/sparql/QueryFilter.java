package de.uni_passau.fim.dimis.rest2sparql.sparql;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/22/13
 * Time: 6:31 PM
 * To change this template use File | Settings | File Templates.
 */
public abstract class QueryFilter {

    public enum FilterType {
        CUBE,
        DIMENSION,
        MEASURE;
    }

    protected FilterType type;
    private String filter;

    public QueryFilter(FilterType type) {
        this.type = type;
    }

    /**
     * Generate the Query. Format is "?[VAR_NAME] = [FILTER]"
     * @param VariableName The name of the variable. Don't prepend the '?'!
     * @return The filter String
     */
    public abstract String GenerateQueryFilter(String VariableName);
}
