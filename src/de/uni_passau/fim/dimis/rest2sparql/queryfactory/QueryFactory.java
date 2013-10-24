package de.uni_passau.fim.dimis.rest2sparql.queryfactory;

import de.uni_passau.fim.dimis.util.CubeObject;
import de.uni_passau.fim.dimis.util.FixedDimension;
import de.uni_passau.fim.dimis.util.PrefixCollection;
import de.uni_passau.fim.dimis.util.SparqlPrefix;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/22/13
 * Time: 4:55 PM
 * To change this template use File | Settings | File Templates.
 */
public class QueryFactory {

    private static final String OBSERVATION = "OBS_NAME";
    private PrefixCollection PrefixManager = new PrefixCollection();

    public QueryFactory() {
        PrefixManager.addPrefix(new SparqlPrefix("qb", "http://purl.org/linked-data/cube#"));
        PrefixManager.addPrefix(new SparqlPrefix("code", "http://code-research.eu/resource/"));
        PrefixManager.addPrefix(new SparqlPrefix("rdfs", "http://www.w3.org/2000/01/rdf-schema#"));
    }

    public String buildObservationQuery(String cubeName, List<CubeObject> objects) {

        generateVarNames(objects);

        StringBuilder selectString = new StringBuilder("SELECT ?" + OBSERVATION + " ?CUBE_NAME ");
        StringBuilder whereString = new StringBuilder("WHERE { ?" + OBSERVATION + " a qb:Observation. ");
        StringBuilder filters = new StringBuilder("FILTER (?CUBE_NAME = code:" + cubeName + "). ");

        for (CubeObject c : objects) {
            for (String s : c.getAllVarNames()) {
                // select string
                selectString.append("?");
                selectString.append(s);
                selectString.append(" ");
            }

            // where string
            whereString.append(c.buildPattern(OBSERVATION));

            // filter string
            filters.append(c.buildFilterString());
            if (c instanceof FixedDimension) {
                filters.append(((FixedDimension) c).buildEntityFilterString());
            }
        }
        whereString.append("?" + OBSERVATION + " qb:dataSet ?CUBE_NAME. ");

        StringBuilder query = new StringBuilder();
        query.append(PrefixManager.createPrefixString());
        query.append(selectString);
        query.append(whereString);
        query.append(filters);
        query.append("}");

        return query.toString();
    }

    private void generateVarNames(List<CubeObject> o) {

        int i = 0;
        for (CubeObject c : o) {
            c.setVarName("NAME_" + Integer.toString(i));
            i++;
        }

    }
}
