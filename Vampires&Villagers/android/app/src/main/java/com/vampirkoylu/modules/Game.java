package com.vampirkoylu2.modules;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.Arguments;

import java.util.*;

public class Game {

    GameLogic gameLogic = new GameLogic();

    public ArrayList<String> orderedPlayers;

    public String revengeName;

    private HashMap<String, String> gameMap;  // Map < "Player's name" ,  "Player's role" >

    private HashMap<String, LinkedList<String[]>> convertedRoleActions;

    public Game(ArrayList<String> roles, ArrayList<String> players){
        shuffleSetGameMap(roles, players);
    }

    public void shuffleSetGameMap(ArrayList<String> roles, ArrayList<String> players){
        gameMap = new HashMap<>();

        orderedPlayers = players;

        int size = players.size();

        String[] shuffledRoles = new String[size];
        for (int i = 0; i < size; i++) {
            shuffledRoles[i] = roles.get(i);
        }

        Random random = new Random();

        for(int i=size-1 ; i>0 ; i--){           //shuffle the roles
            int rand = random.nextInt(i+1);

            String temp = shuffledRoles[i];
            shuffledRoles[i] = shuffledRoles[rand];
            shuffledRoles[rand] = temp;
        }

        for(int i=0 ; i<size-1 ; i++){           //shuffle the roles
            int rand = random.nextInt(size-i)+i;

            String temp = shuffledRoles[i];
            shuffledRoles[i] = shuffledRoles[rand];
            shuffledRoles[rand] = temp;
        }

        for(int i=size-1 ; i>0 ; i--){           //shuffle the roles
            int rand = random.nextInt(i+1);

            String temp = shuffledRoles[i];
            shuffledRoles[i] = shuffledRoles[rand];
            shuffledRoles[rand] = temp;
        }

        for(int i=0 ; i<size-1 ; i++){           //shuffle the roles
            int rand = random.nextInt(size-i)+i;

            String temp = shuffledRoles[i];
            shuffledRoles[i] = shuffledRoles[rand];
            shuffledRoles[rand] = temp;
        }

        for(int i=0 ; i<size ; i++){
            gameMap.put(players.get(i), shuffledRoles[i]);  //set gameMap
        }
    }

    public WritableArray getOrderedPlayers(){
        WritableArray resultArr = Arguments.createArray();

        for(String name : orderedPlayers){
            resultArr.pushString(name);
        }

        return resultArr;
    }

    public void setGameMap(ReadableMap newGameMap) {
        HashMap<String, String> convertedNewGameMap = new HashMap<>();

        ReadableMapKeySetIterator iterator = newGameMap.keySetIterator();
        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            String value = newGameMap.getString(key);

            convertedNewGameMap.put(key, value);
        }

        Set<String> oldPlayerList = gameMap.keySet();
        Set<String> newPlayerList = convertedNewGameMap.keySet();

        for(String name : oldPlayerList){
            if(! newPlayerList.contains(name) && gameMap.get(name).equals("soytarı")){
                convertedNewGameMap.put(name, "revenge");
                revengeName = name;
            }
        }

        gameMap = convertedNewGameMap;
    }

    public WritableMap getGameMap(){
        WritableMap resultMap = Arguments.createMap();
        for (Map.Entry<String, String> entry : gameMap.entrySet()) {
            resultMap.putString(entry.getKey(), entry.getValue());
        }

        if(revengeName != null){
            gameMap.remove(revengeName);
            revengeName = null;
        }

        return resultMap;
    }

    public void setRoleActions(ReadableMap roleActions){

        convertedRoleActions = new HashMap<>();

        // ReadableMap -> HashMap<String, LinkedList<String>>
        ReadableMapKeySetIterator iterator = roleActions.keySetIterator();
        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            ReadableArray bigArray = roleActions.getArray(key);
            LinkedList<String[]> actionList = new LinkedList<>();

            if (bigArray != null) {
                for (int i = 0; i < bigArray.size(); i++) {
                    ReadableArray innerArray = bigArray.getArray(i);

                    String[] actionArray = new String[2];
                    actionArray[0] = innerArray.getString(0);
                    actionArray[1] = innerArray.getString(1);

                    actionList.add(actionArray);
                }
            }

            convertedRoleActions.put(key, actionList);
        }
    }

    public WritableMap getRoleActions(){
        WritableMap roleActions = Arguments.createMap();

        if(convertedRoleActions == null) return roleActions;

        for (Map.Entry<String, LinkedList<String[]>> entry : convertedRoleActions.entrySet()) {
            WritableArray bigArray = Arguments.createArray();

            for (String[] array : entry.getValue()) {
                WritableArray innerArray = Arguments.createArray();

                innerArray.pushString(array[0]);
                innerArray.pushString(array[1]);

                bigArray.pushArray(innerArray);
            }

            roleActions.putArray(entry.getKey(), bigArray);
        }

        return roleActions;
    }

    public WritableMap getNextDaysGameMap(){

        gameLogic.setCurrentDaysGameMapAndRoleActions(gameMap, convertedRoleActions);
        gameLogic.executeNextDay();

        gameMap = gameLogic.getNextDaysGameMap();

        // HashMap<String, LinkedList<String>> -> WritableMap
        WritableMap nextGameMap = Arguments.createMap();
        for (Map.Entry<String, String> entry : gameMap.entrySet()) {
            nextGameMap.putString(entry.getKey(), entry.getValue());
        }

        return nextGameMap;
    }
}