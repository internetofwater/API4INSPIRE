package com.inspire.development.config;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.inspire.development.collections.ImportantLinkList;
import com.inspire.development.controller.RESTController;

import javax.servlet.ServletContext;
import java.awt.*;
import java.io.File;
import java.net.URL;
import java.nio.file.Path;

public class Config {
    DBConnectorList connectors;
    String logPath;
    String sqlitePath;
    String configPath;
    ImportantLinkList importantLinks;

    public Config(){
        //String path = RESTController.getServletContext().getRealPath("/WEB-INF");

        URL url = this.getClass().getClassLoader().getResource("../");
        String path = url.getPath();

        logPath = path + "logs";

        if(System.getenv("LOG") == null)
            System.setProperty("log4j",logPath);

        sqlitePath = path + "sqlite";
        configPath = path + "config.json";
        connectors = new DBConnectorList();
        importantLinks = new ImportantLinkList();
    }

    public ImportantLinkList getImportantLinks() {
        return importantLinks;
    }

    public Config(@JsonProperty("logPath") String logPath, @JsonProperty("sqlitePath") String sqlitePath, @JsonProperty("connectors") DBConnectorList connectors, @JsonProperty("importantLinks") ImportantLinkList importantLinks,@JsonProperty("configPath") String configPath){
        this.logPath = logPath;

        if(System.getenv("LOG") == null)
            System.setProperty("log4j",logPath);

        this.sqlitePath = sqlitePath;
        this.configPath = configPath;
        this.connectors = connectors;
        this.importantLinks = importantLinks;
    }

    public DBConnectorList getConnectors() {
        return connectors;
    }

    public String getLogPath() {
        if(System.getenv("LOG") != null){
            return System.getenv("LOG");
        }
        return logPath;
    }

    public String getSqlitePath() {
        if(System.getenv("SQLITE") != null){
            return System.getenv("SQLITE");
        }
        return sqlitePath;
    }

    public void setLogPath(String logPath) {
        System.setProperty("LOG",logPath);
        this.logPath = logPath;
    }

    public void setSqlitePath(String sqlitePath) {
        this.sqlitePath = sqlitePath;
    }

    @JsonIgnore
    public String getPagingLimit(){
        if(System.getenv("PAGING_LIMIT") != null){
            return System.getenv("PAGING_LIMIT");
        }
        return "10000";
    }

    public String getConfigPath() {
        return configPath;
    }

}
