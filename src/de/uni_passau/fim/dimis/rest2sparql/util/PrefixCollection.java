package de.uni_passau.fim.dimis.rest2sparql.util;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/23/13
 * Time: 2:20 PM
 */
public class PrefixCollection {

    private LinkedHashMap<String, String> prefixes = new LinkedHashMap<>();

    /**
     * Adds a {@link SparqlPrefix}.
     *
     * @param p The {@link SparqlPrefix} to add.
     * @throws IllegalArgumentException If the prefix, abbreviation or URL already exist.
     */
    public void addPrefix(SparqlPrefix p) {

        if (!prefixes.containsKey(p.getUrl())) {
            if (prefixes.containsValue(p.getAbbreviation())) {

            } else {
                prefixes.put(p.getUrl(), p.getAbbreviation());
            }
        }


    }

    /**
     * Returns the abbreviation for a given url in the database. Returns null, if the url is not found.
     *
     * @param url The url to get the abbreviation for.
     * @return the abbreviation for a given url in the database. Returns null, if the url is not found.
     */
    public String getAbbreviation(String url) {

        String res = null;

        if (prefixes.containsKey(url)) {
            res = prefixes.get(url);
        }

        return res;
    }

    /**
     * Removes a prefix defined by an url if it is in the set.
     *
     * @param url The url to remove.
     * @return <code>true</code> if the prefix existed and was removed.
     */
    public boolean deletePrefix(String url) {
        if (!prefixes.containsKey(url)) {
            return false;
        } else {
            prefixes.remove(url);
            return true;
        }
    }

    public boolean existsUrl(String s) {
        return prefixes.containsKey(s);
    }

    public boolean existsAbbreviation(String s) {
        return prefixes.containsValue(s);
    }

    /**
     * Creates a {@link String} of all prefixes that can be used in a SPARQL query. Prefixes are delimited by spaces.
     *
     * @return The prefixstring.
     */
    public String createPrefixString() {
        return createPrefixString(" ");
    }

    /**
     * Creates a {@link String} of all prefixes that can be used in a SPARQL query.
     *
     * @param delimiter The {@link String} to place between the prefixes.
     * @return The prefixstring.
     */
    public String createPrefixString(String delimiter) {
        StringBuilder sb = new StringBuilder();
        Set<Map.Entry<String, String>> es = prefixes.entrySet();
        for (Map.Entry e : es) {
            sb.append("PREFIX ");
            sb.append(e.getValue());
            sb.append(": <");
            sb.append(e.getKey());
            sb.append(">");
            sb.append(delimiter);
        }
        return sb.toString();
    }
}
