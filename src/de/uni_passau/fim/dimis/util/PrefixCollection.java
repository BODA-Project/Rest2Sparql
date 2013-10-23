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

    public void addPrefix(SparqlPrefix p) throws IllegalArgumentException {

        if (prefixes.contains(p)) {
            throw new IllegalArgumentException("Prefix already exists!");
        } else if (prefs.contains(p.getPrefix())) {
            throw new IllegalArgumentException("Abbreviation already exists!");
        } else if (urls.contains(p.getUrl())) {
            throw new IllegalArgumentException("URL already exists!");
        } else {
            prefixes.add(p);
            prefs.add(p.getPrefix());
            urls.add(p.getUrl());
        }


    }

    public boolean deletePrefix(SparqlPrefix p) {
        if (!prefixes.contains(p)) {
            return false;
        } else {
            prefixes.remove(p);
            prefs.remove(p.getPrefix());
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

    public String createPrefixString() {
        return createPrefixString(" ");
    }

    public String createPrefixString(String delimiter) {
        StringBuilder sb = new StringBuilder();
        for (SparqlPrefix p : prefixes) {
            sb.append(p.toString());
            sb.append(delimiter);
        }
        return sb.toString();
    }
}
