package de.uni_passau.fim.dimis.rest2sparql.rest;

import de.uni_passau.fim.dimis.rest2sparql.queryfactory.QueryDescriptor;
import de.uni_passau.fim.dimis.rest2sparql.rest.restadapter.Methods;
import de.uni_passau.fim.dimis.rest2sparql.util.*;
import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;

import java.nio.charset.Charset;
import java.util.*;

import static de.uni_passau.fim.dimis.rest2sparql.util.Parameters.AggregateFunction;
import static de.uni_passau.fim.dimis.rest2sparql.util.Parameters.Relation;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/31/13
 * Time: 12:57 PM
 * <p/>
 * Class that contains a few static methods to validate and examine URLs.
 */
public final class URLConverter {

    private static final String FUNCTION_STR = "func";
    @SuppressWarnings("unused")
    private static final char MASK = '\'';
    private static Map<String, Methods> strToMethMap = new HashMap<>();
    private static Set<String> validParams = new HashSet<>();
    private static Set<String> validOpts = new HashSet<>();
    private static Map<String, AggregateFunction> strToAggFuncMap = new HashMap<>();
    private static Map<String, Relation> strToRelMap = new HashMap<>();

    static {
        strToMethMap.put("<getCubes>", Methods.GET_CUBES);
        strToMethMap.put("<getDimensions>", Methods.GET_DIMENSIONS);
        strToMethMap.put("<getMeasures>", Methods.GET_MEASURES);
        strToMethMap.put("<getEntities>", Methods.GET_ENTITIES);
        strToMethMap.put("<execute>", Methods.EXECUTE);
        strToMethMap.put("<getHash>", Methods.GET_HASH);

        validParams.add("func");
        validParams.add("limit");
        validParams.add("id");
        validParams.add("hash");
        validParams.add("c");
        validParams.add("d");
        validParams.add("m");

        validOpts.add("v");         // value that has no explicit option name
        validOpts.add("fix");       // may only occur in dimensions an fixes it to a specified entity
        validOpts.add("select");
        validOpts.add("order");
        validOpts.add("group");
        validOpts.add("agg");
        validOpts.add("filterR");
        validOpts.add("filterV");
        validOpts.add("havingAgg");
        validOpts.add("havingR");
        validOpts.add("havingV");

        strToAggFuncMap.put("count", AggregateFunction.COUNT);
        strToAggFuncMap.put("sum", AggregateFunction.SUM);
        strToAggFuncMap.put("min", AggregateFunction.MIN);
        strToAggFuncMap.put("max", AggregateFunction.MAX);
        strToAggFuncMap.put("avg", AggregateFunction.AVG);
        strToAggFuncMap.put("group_concat", AggregateFunction.GROUP_CONCAT);
        strToAggFuncMap.put("sample", AggregateFunction.SAMPLE);

        strToRelMap.put("smaller", Relation.SMALLER);
        strToRelMap.put("smaller_or_eq", Relation.SMALLER_OR_EQUAL);
        strToRelMap.put("eq", Relation.EQUAL);
        strToRelMap.put("not_eq", Relation.NOT_EQUAL);
        strToRelMap.put("bigger", Relation.BIGGER);
        strToRelMap.put("bigger_or_eq", Relation.BIGGER_OR_EQUAL);
    }

    /**
     * Parses the given url and extracts the function parameter.
     *
     * @param url The url to parse.
     * @return The {@link Methods} that is indicated by the function parameter in the url.
     */
    public static Methods getMethod(String url) {

        List<NameValuePair> l = URLEncodedUtils.parse(url, Charset.defaultCharset());

        for (NameValuePair p : l) {
            if (p.getName().equals(FUNCTION_STR)) {

                String func = p.getValue();

                if (strToMethMap.containsKey(func)) {
                    return strToMethMap.get(func);
                } else {
                    throw new IllegalArgumentException("\'" + func + "\' is not a vaild function!");
                }
            }
        }

        throw new IllegalArgumentException("No parameter found that indicates a function!");

    }

    /**
     * Parses the given url and returns a {@link List} of {@link CubeObject}s generated from the parameters.
     *
     * @param url The url to parse.
     * @return A {@link List} of {@link CubeObject}s generated from the parameters.
     */
    @Deprecated
    @SuppressWarnings("unused")
    public static List<CubeObject> getParameters(String url) {

        List<NameValuePair> l = URLEncodedUtils.parse(url, Charset.defaultCharset());
        List<CubeObject> params = new ArrayList<>(l.size());

        for (NameValuePair p : l) {

            Map<String, String> opts = parseOpts(p.getValue());

            switch (p.getName()) {
                case "c":
                    params.add(new Cube(opts.get("v"), parseValue(opts)));
                    break;

                case "d":
                    if (opts.containsKey("fix")) {
                        String tmp = opts.remove("fix");
                        params.add(new FixedDimension(opts.get("v"), tmp, parseValue(opts)));
                    } else {
                        params.add(new Dimension(opts.get("v"), parseValue(opts)));
                    }
                    break;

                case "m":
                    params.add(new Measure(opts.get("v"), parseValue(opts)));
                    break;

                case "limit":
                case "func":
                    // Nothing to do
                    break;

                default:
                    throw new IllegalArgumentException("There are invalid parameters in the url! Use the validate method first!");
            }

        }

        return params;
    }

    /**
     * Parses the given url and returns a {@link de.uni_passau.fim.dimis.rest2sparql.queryfactory.QueryDescriptor} generated from the parameters.
     *
     * @param url The url to parse.
     * @return A {@link de.uni_passau.fim.dimis.rest2sparql.queryfactory.QueryDescriptor} generated from the parameters.
     */
    public static QueryDescriptor getQueryDescriptor(String url) {

        List<NameValuePair> l = URLEncodedUtils.parse(url, Charset.defaultCharset());
        List<CubeObject> params = new ArrayList<>(l.size());
        int limit = -1;
        String ID = null, hash = null;

        for (NameValuePair p : l) {

            Map<String, String> opts = parseOpts(p.getValue());

            switch (p.getName()) {
                case "c":
                    params.add(new Cube(opts.get("v"), parseValue(opts)));
                    break;

                case "d":
                    if (opts.containsKey("fix")) {
                        String tmp = opts.remove("fix");
                        params.add(new FixedDimension(opts.get("v"), tmp, parseValue(opts)));
                    } else {
                        params.add(new Dimension(opts.get("v"), parseValue(opts)));
                    }
                    break;

                case "m":
                    params.add(new Measure(opts.get("v"), parseValue(opts)));
                    break;

                case "limit":
                    limit = Integer.parseInt(opts.get("v"));
                    break;

                case "id":
                    ID = opts.get("v");
                    break;

                case "hash" :
                    hash = opts.get("v");
                    break;

                case "func":
                    // Nothing to do
                    break;

                default:
                    throw new IllegalArgumentException("There are invalid parameters in the url! Use the validate method first!");
            }

        }

        return new QueryDescriptor(params, limit, ID, hash);
    }

    /**
     * Validates an url and returns a {@link List} of {@link String}s with the parameters in the url that are not vaild.
     * Returns an empty {@link List}, if the url is valid.
     *
     * @param url The url to validate.
     * @return A {@link List} of {@link String}s with the invalid parameters or an empty {@link List} if all parameters are valid.
     */
    public static List<String> validate(String url) {

        List<NameValuePair> l = URLEncodedUtils.parse(url, Charset.defaultCharset());
        List<String> invalidParams = new ArrayList<>(l.size());
        boolean foundFunc = false;
        boolean multipleFuncs = false;

        for (NameValuePair p : l) {

            // check if valid parameter
            if (!validParams.contains(p.getName())) {

                // if not, add to list
                invalidParams.add("Invaid parameter: \'" + p.getName() + "\'");

            } else {

                // if valid, check if function
                if (p.getName().equals(FUNCTION_STR)) {

                    // if function and no function parameter found before, set flag
                    if (!foundFunc) {
                        foundFunc = true;
                    }

                    // if function but there was one before, set flag
                    else {
                        multipleFuncs = true;
                    }

                    // check if the function is valid
                    if (!strToMethMap.containsKey(p.getValue())) {
                        invalidParams.add("Unknown Function: \'" + p.getValue() + "\'");
                    }
                }

                // check if all options are valid
                else {
                    Map<String, String> opts = parseOpts(p.getValue());

                    for (Map.Entry<String, String> e : opts.entrySet()) {

                        // check if option is valid
                        if (!validOpts.contains(e.getKey())) {
                            invalidParams.add("Invaid option: \'" + e.getKey() + "\' in parameter \'" + p.getName() + "\'");
                        }

                        // fix is only allowed in dimensions
                        else if (e.getKey().equals("fix") && !p.getName().equals("d")) {
                            invalidParams.add("The option \'fix\' can only be applied to dimensions");
                        }

                        // check if value is valid
                        else {
                            if (!validateOpts(e.getKey(), e.getValue())) {
                                invalidParams.add("Invaid value: \'" + e.getValue() + "\' in option \'" + e.getKey() + "\' in parameter \'" + p.getName() + "\'");
                            }
                        }
                    }
                }
            }
        }

        if (!foundFunc) {
            invalidParams.add("No parameter found that indicates which function to use!");
        }

        if (multipleFuncs) {
            invalidParams.add("There were multiple parameters found that indicate which function to use!");
        }

        return invalidParams;
    }

    /**
     * Decides if a {@link Dimension} or {@link FixedDimension} is needed, creates the object and returns it.
     *
     * @param s The part of the url to parse.
     * @return A {@link Dimension} or {@link FixedDimension}.
     */
    @Deprecated
    @SuppressWarnings("unused")
    private static Dimension parseDimension(String s) {

        Dimension retVal;

        if (s.contains("=")) {
            retVal = new FixedDimension(s.split("=")[0], s.split("=")[1]);
        } else {
            retVal = new Dimension(s);
        }

        return retVal;
    }

    private static Map<String, String> parseOpts(String s) {

        HashMap<String, String> retVal = new HashMap<>();

        String[] parts = s.split(">,");

        // the first value is no real option with a key, so just strip the leading '<' and tailing '>'
        if (parts[0].charAt(0) == '<' && parts[0].charAt(parts[0].length() - 1) == '>') {
            parts[0] = parts[0].substring(1, parts[0].length() - 1);
        } else if (parts[0].charAt(0) == '<') {
            parts[0] = parts[0].substring(1, parts[0].length());
        } else if (parts[0].charAt(parts[0].length() - 1) == '>') {
            parts[0] = parts[0].substring(0, parts[0].length() - 1);
        }
        retVal.put("v", parts[0]);

        String key, value;
        String[] pair;
        for (int i = 1; i < parts.length; i++) {

            pair = parts[i].split("=<");
            key = pair[0];
            value = pair[1].split(">")[0];

            retVal.put(key, value);
        }

        return retVal;
    }

    private static Parameters parseValue(Map<String, String> opts) {

        ParametersFactory paramFac = new ParametersFactory();

        for (Map.Entry<String, String> e : opts.entrySet()) {

            switch (e.getKey()) {

                case "v":
                case "fix":
                    break;

                case "select":
                    switch (e.getValue()) {
                        case "true":
                            paramFac.setSelect(true);
                            break;
                        case "false":
                            paramFac.setSelect(false);
                            break;
                        default:
                            throw new IllegalArgumentException();
                    }
                    break;

                case "order":
                    try {
                        paramFac.setOrderBy(Integer.parseInt(e.getValue()));
                    } catch (NumberFormatException ex) {
                        throw new IllegalArgumentException();
                    }
                    break;

                case "group":
                    switch (e.getValue()) {
                        case "true":
                            paramFac.setGroupBy(true);
                            break;
                        case "false":
                            paramFac.setGroupBy(false);
                            break;
                        default:
                            throw new IllegalArgumentException();
                    }
                    break;

                case "agg":
                    if (strToAggFuncMap.containsKey(e.getValue())) {
                        paramFac.setAggregate(strToAggFuncMap.get(e.getValue()));
                    } else {
                        throw new IllegalArgumentException();
                    }
                    break;

                case "filterR":
                    if (strToRelMap.containsKey(e.getValue())) {
                        paramFac.setFilterRelation(strToRelMap.get(e.getValue()));
                    } else {
                        throw new IllegalArgumentException();
                    }
                    break;

                case "filterV":
                    paramFac.setFilterValue(e.getValue());
                    break;

                case "havingAgg":
                    if (strToAggFuncMap.containsKey(e.getValue())) {
                        paramFac.setHavingAggregate(strToAggFuncMap.get(e.getValue()));
                    } else {
                        throw new IllegalArgumentException();
                    }
                    break;

                case "havingR":
                    if (strToRelMap.containsKey(e.getValue())) {
                        paramFac.setHavingRelation(strToRelMap.get(e.getValue()));
                    } else {
                        throw new IllegalArgumentException();
                    }
                    break;

                case "havingV":
                    paramFac.setHavingValue(e.getValue());
                    break;

                default:
                    throw new IllegalArgumentException();
            }
        }

        return paramFac.buildParameters();
    }

    private static boolean validateOpts(String key, String value) {

        switch (key) {

            case "havingV":
            case "filterV":
            case "v":
            case "fix":
                return true;

            case "group":
            case "select":
                return !(!value.equals("true") && !value.equals("false"));

            case "order":
                try {
                    Integer.parseInt(value);
                } catch (NumberFormatException e) {
                    return false;
                }
                return true;

            case "havingAgg":
            case "agg":
                return strToAggFuncMap.containsKey(value);

            case "havingR":
            case "filterR":
                return strToRelMap.containsKey(value);

            default:
                throw new IllegalArgumentException();
        }
    }
}
