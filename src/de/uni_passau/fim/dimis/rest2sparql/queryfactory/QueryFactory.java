package de.uni_passau.fim.dimis.rest2sparql.queryfactory;

import de.uni_passau.fim.dimis.rest2sparql.util.*;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/22/13
 * Time: 4:55 PM
 * <p/>
 * Class that contains static methods to build queries.
 */
public class QueryFactory {

    private static final String OBSERVATION = "OBS_NAME";
    private static PrefixCollection PrefixManager = new PrefixCollection();

    static {
        PrefixManager.addPrefix(new SparqlPrefix("qb", "http://purl.org/linked-data/cube#"));
        PrefixManager.addPrefix(new SparqlPrefix("code", "http://code-research.eu/resource/"));
        PrefixManager.addPrefix(new SparqlPrefix("rdfs", "http://www.w3.org/2000/01/rdf-schema#"));
        PrefixManager.addPrefix(new SparqlPrefix("xsd", "http://www.w3.org/2001/XMLSchema#"));
    }

    @Deprecated
    public static String buildObservationQuery(String cubeName, List<CubeObject> objects) {

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

    /**
     * Builds a query to query for observations.
     *
     * @param objects The objects to include in the query.<p />
     *                This has to include <b>exactly</b> one {@link Cube}.
     *                If this constraint is not met, the behaviour is undefined.
     * @return The query.
     */
    public static String buildObservationQuery(List<CubeObject> objects) {

        generateVarNames(objects);
        Cube cube = null;

        StringBuilder selectString = new StringBuilder("SELECT ?" + OBSERVATION + " ");
        StringBuilder whereString = new StringBuilder("WHERE { ?" + OBSERVATION + " a qb:Observation. ");
        StringBuilder filters = new StringBuilder();

        for (CubeObject c : objects) {

            // if the current CubeObject is a Cube
            if (c instanceof Cube) {

                // if the first Cube is found, mark it
                if (cube == null) {
                    cube = (Cube) c;
                }

                // if this is the second Cube, something went wrong
                else {
                    throw new IllegalArgumentException();
                }
            }

            // if it is not a Cube, add it to where string, because Cube needs special treatment
            else {
                // where string
                whereString.append(c.buildPattern(OBSERVATION));
            }

            for (String s : c.getAllVarNames()) {
                // select string
                selectString.append("?");
                selectString.append(s);
                selectString.append(" ");
            }

            // filter string
            filters.append(c.buildFilterString());
            if (c instanceof FixedDimension) {
                filters.append(((FixedDimension) c).buildEntityFilterString());
            }
        }

        // if Cube was not found, something went wrong
        if (cube == null) {
            throw new IllegalArgumentException();
        }

        // bind to Cube
        whereString.append("?");
        whereString.append(OBSERVATION);
        whereString.append(" qb:dataSet ?");
        whereString.append(cube.getVarName());
        whereString.append(". ");

        StringBuilder query = new StringBuilder();
        query.append(PrefixManager.createPrefixString());
        query.append(selectString);
        query.append(whereString);
        query.append(filters);
        query.append("}");

        return query.toString();
    }

    /**
     * Builds a query to query for observations.
     *
     * @param queryDescriptor An object of the type {@link QueryDescriptor} that contains all information to build a query.
     * @return The query.
     */
    public static String buildObservationQuery(QueryDescriptor queryDescriptor) {

        queryDescriptor.generateVarNames();
        Cube cube;

        StringBuilder selectString = new StringBuilder(queryDescriptor.selectString());

        // only show the observation names, if there is no GROUP BY statement in the query
        if (!queryDescriptor.isGrouped()) {
            selectString.append('?');
            selectString.append(OBSERVATION);
            selectString.append(' ');
        }

        StringBuilder whereString = new StringBuilder("WHERE { ?");
        whereString.append(OBSERVATION);
        whereString.append(" a qb:Observation. ");
        whereString.append(queryDescriptor.whereString(OBSERVATION, true));
        String filters = queryDescriptor.filterString();


        // if Cube was not found, something went wrong
        if (queryDescriptor.nofCubes() != 1) {
            throw new IllegalArgumentException();
        }

        cube = queryDescriptor.getCubes().get(0);

        // bind to Cube
        whereString.append("?");
        whereString.append(OBSERVATION);
        whereString.append(" qb:dataSet ?");
        whereString.append(cube.getVarName());
        whereString.append(". ");

        StringBuilder query = new StringBuilder();
        query.append(PrefixManager.createPrefixString());
        query.append(selectString);
        query.append(whereString);
        query.append(filters);
        query.append("} ");
        query.append(queryDescriptor.groupByString());
        query.append(queryDescriptor.havingString());
        query.append(queryDescriptor.orderByString());
        query.append(queryDescriptor.limitString());

        return query.toString();
    }

    private static void generateVarNames(List<CubeObject> o) {

        int i = 0;
        for (CubeObject c : o) {
            c.setVarName("NAME_" + Integer.toString(i), true);
            i++;
        }

    }
}
