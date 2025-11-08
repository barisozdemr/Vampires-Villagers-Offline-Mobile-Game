package com.vampirkoylu2.modules;

import com.facebook.react.bridge.ReadableArray;
import java.util.ArrayList;

public class GameStarter {
    private int totalPlayerCount;

    private ArrayList<String> playerList;

    private ArrayList<String> roleList;

    public void setPlayers(ReadableArray players){
        playerList = new ArrayList<String>();

        for (int i = 0; i < players.size(); i++) {
            playerList.add(players.getString(i));
        }

        totalPlayerCount = playerList.size();
    }

    public int getTotalPlayerCount(){
        return totalPlayerCount;
    }

    public Game setRolesAndStartGame(ReadableArray roles){
        roleList = new ArrayList<String>();

        for (int i = 0; i < roles.size(); i++) {
            roleList.add(roles.getString(i));
        }

        return new Game(roleList, playerList);
    }
}