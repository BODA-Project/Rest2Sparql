package de.uni_passau.fim.dimis.util;

import java.util.HashSet;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/23/13
 * Time: 2:20 PM
 * To change this template use File | Settings | File Templates.
 */
public class PrefixCollection {

    private HashSet<SparqlPrefix> prefixes = new HashSet<>();
    private HashSet<String> prefs = new HashSet<>();
    private HashSet<String> urls = new HashSet<>();

    /**
     * Adds a {@SparqlPrefix}.
     * @param p The {@SparqlPrefix} to add.
     * @throws IllegalArgumentException If the prefix, abbreviation or URL already exist.
     */
    public void addPrefix(SparqlPrefix p) throws IllegalArgumentException {

        if (prefixes.contains(p)) {
            throw new IllegalArgumentException("Prefix already exists!");
        } else if (prefs.contains(p.getAbbreviation())) {
            throw new IllegalArgumentException("Abbreviation already exists!");
        } else if (urls.contains(p.getUrl())) {
            throw new IllegalArgumentException("URL already exists!");
        } else {
            prefixes.add(p);
            prefs.add(p.getAbbreviation());
            urls.add(p.getUrl());
        }

    }

    /**
     * Adds a {@SparqlPrefix}, if it is not already in the set.
     * @param p The {@SparqlPrefix} to add.
     * @throws IllegalArgumentException If the prefix is not in the set, but the abbreviation or the URL exists.
     */
    public void addPrefixIfNotExists(SparqlPrefix p) throws IllegalArgumentException {

        if (!prefixes.contains(p))
            if (prefs.contains(p.getAbbreviation()) || urls.contains(p.getUrl())) {
                throw new IllegalArgumentException("The Prefix does not exist, but either the abbreviation or the url exist!");
            } else {
                prefixes.add(p);
                prefs.add(p.getAbbreviation());
                urls.add(p.getUrl());
            }
    }

    /**
     * Removes a {@SparqlPrefix} if it is in the set.
     * @param p The {@SparqlPrefix} to remove.
     * @return <code>true</code> if the prefix existed and was removed.
     */
    public boolean deletePrefix(SparqlPrefix p) {
        if (!prefixes.contains(p)) {
            return false;
        } else {
            prefixes.remove(p);
            prefs.remove(p.getAbbreviation());
            urls.remove(p.getUrl());
            return true;
        }
    }

    public boolean existsUrl(String s) {
        return urls.contains(s);
    }

    public boolean existsPrefix(String s) {
        return prefs.contains(s);
    }

    /**
     * Creates a {@String} of all prefixes that can be used in a SPARQL query. Prefixes are delimited by spaces.
     * @return The prefixstring.
     */
    public String createPrefixString() {
        return createPrefixString(" ");
    }

    /**
     * Creates a {@String} of all prefixes that can be used in a SPARQL query.
     * @param delimiter The {@String} to place between the prefixes.
     * @return The prefixstring.
     */
    public String createPrefixString(String delimiter) {
        StringBuilder sb = new StringBuilder();
        for (SparqlPrefix p : prefixes) {
            sb.append(p.toString());
            sb.append(delimiter);
        }
        return sb.toString();
    }
}
