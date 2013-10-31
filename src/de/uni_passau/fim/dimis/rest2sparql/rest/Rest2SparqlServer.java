package de.uni_passau.fim.dimis.rest2sparql.rest;

import de.uni_passau.fim.dimis.rest2sparql.rest.restadapter.IRestAdapter;
import org.apache.http.*;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.DefaultBHttpServerConnection;
import org.apache.http.impl.DefaultBHttpServerConnectionFactory;
import org.apache.http.protocol.*;

import java.io.IOException;
import java.io.InterruptedIOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.List;
import java.util.Locale;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/24/13
 * Time: 2:38 PM
 * <p/>
 * <a href="http://hc.apache.org/httpcomponents-core-4.3.x/httpcore/examples/org/apache/http/examples/ElementalHttpServer.java">Apache Documentation</a>
 */
public class Rest2SparqlServer {

    private int port;
    private IRestAdapter adapter;

    public Rest2SparqlServer(IRestAdapter adapter, int port) {
        this.port = port;
        this.adapter = adapter;
    }

    public boolean startServer() throws IOException {

        // Set up the HTTP protocol processor
        HttpProcessor httpproc = HttpProcessorBuilder.create()
                .add(new ResponseDate())
                .add(new ResponseServer("Test/1.1"))
                .add(new ResponseContent())
                .add(new ResponseConnControl()).build();

        // Set up request handlers
        UriHttpRequestHandlerMapper reqistry = new UriHttpRequestHandlerMapper();
        reqistry.register("*", new HttpRestHandler());

        // Set up the HTTP service
        HttpService httpService = new HttpService(httpproc, reqistry);

        Thread t = new RequestListenerThread(port, httpService);
        t.setDaemon(false);
        t.start();

        return false; // TODO
    }

    static class HttpRestHandler implements HttpRequestHandler {

        @Override
        public void handle(HttpRequest request,
                           HttpResponse response,
                           HttpContext context) throws HttpException, IOException {

            String method = request.getRequestLine().getMethod().toUpperCase(Locale.ENGLISH);
            if (!method.equals("GET")) {
                throw new MethodNotSupportedException(method + " method not supported");
            }
            String target = request.getRequestLine().getUri();
            target = target.substring(target.indexOf("?") + 1);

            HttpEntity body = null;

            // Validate the String
            List<String> invalidParams = URLConverter.validate(target);

            // If the URL contains invalid parameters, notify the user
            if (!invalidParams.isEmpty()) {
                StringBuilder sb = new StringBuilder("The URL contains invalid parameters!\nHere is a list:\n");
                for (String s : invalidParams) {
                    sb.append(s);
                    sb.append('\n');
                }

                body = new StringEntity(sb.toString());
                response.setStatusCode(HttpStatus.SC_OK); // TODO set correct response code
            } else {

                // TODO content header, content
                response.setStatusCode(HttpStatus.SC_OK);
                body = new StringEntity("OKAY!!");

            }

            // System.out.println(target);
            // List<NameValuePair> l = URLEncodedUtils.parse(target, Charset.defaultCharset());

            //for (NameValuePair p : l) {
            //    System.out.println(p.getName() + ", " + p.getValue());
            //}

            // response.setStatusCode(HttpStatus.SC_OK);
            // StringEntity body = new StringEntity("OKAY!!");
            response.setEntity(body);
        }

    }

    static class RequestListenerThread extends Thread {

        private final HttpConnectionFactory<DefaultBHttpServerConnection> connFactory;
        private final ServerSocket socket;
        private final HttpService httpService;

        public RequestListenerThread(int port, HttpService service) throws IOException {

            connFactory = DefaultBHttpServerConnectionFactory.INSTANCE;
            socket = new ServerSocket(port);
            httpService = service;
        }

        @Override
        public void run() {
            while (!Thread.interrupted()) {
                try {
                    // Set up HTTP connection
                    Socket socket = this.socket.accept();
                    HttpServerConnection conn = this.connFactory.createConnection(socket);

                    // Start worker thread
                    Thread t = new WorkerThread(this.httpService, conn);
                    t.setDaemon(true);
                    t.start();
                } catch (InterruptedIOException ex) {
                    break;
                } catch (IOException e) {
                    System.err.println("I/O error initialising connection thread: "
                            + e.getMessage());
                    break;
                }
            }
        }
    }

    static class WorkerThread extends Thread {

        private final HttpService httpservice;
        private final HttpServerConnection conn;

        public WorkerThread(
                final HttpService httpservice,
                final HttpServerConnection conn) {
            super();
            this.httpservice = httpservice;
            this.conn = conn;
        }

        @Override
        public void run() {
            HttpContext context = new BasicHttpContext(null);
            try {
                while (!Thread.interrupted() && this.conn.isOpen()) {
                    this.httpservice.handleRequest(this.conn, context);
                }
            } catch (ConnectionClosedException ex) {
                System.err.println("Client closed connection");
            } catch (IOException ex) {
                System.err.println("I/O error: " + ex.getMessage());
            } catch (HttpException ex) {
                System.err.println("Unrecoverable HTTP protocol violation: " + ex.getMessage());
            } finally {
                try {
                    this.conn.shutdown();
                } catch (IOException ignore) {
                }
            }
        }

    }
}
