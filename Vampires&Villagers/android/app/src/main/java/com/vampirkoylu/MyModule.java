package com.vampirkoylu2;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.Promise;

import com.vampirkoylu2.modules.Game;
import com.vampirkoylu2.modules.GameStarter;

public class MyModule extends ReactContextBaseJavaModule {
    public MyModule(ReactApplicationContext context) {
        super(context);
    }

    private GameStarter gameStarter = new GameStarter();

    private Game game;

    @Override
    public String getName() {
        return "MyModule";
    }

    // ===============================================// Game Starter //============================
    @ReactMethod
    public void setPlayers(ReadableArray players){
        gameStarter.setPlayers(players);
    }

    @ReactMethod
    public int getTotalPlayerCount(){
        return gameStarter.getTotalPlayerCount();
    }

    @ReactMethod
    public void setRolesAndStartGame(ReadableArray roles, Promise promise) {
        try {
            game = gameStarter.setRolesAndStartGame(roles);
            promise.resolve("ok");
        } catch (Exception e) {
            promise.reject("ERR", e);
        }
    }
    //==============================================================================================

    //================================================// Game //====================================

    @ReactMethod
    public void getOrderedPlayers(Promise promise) {
        try {
            WritableArray arr = game.getOrderedPlayers();
            promise.resolve(arr);
        } catch (Exception e) {
            promise.reject("ERR", e);
        }
    }

    @ReactMethod
    public void getGameMap(Promise promise) {
        try {
            WritableMap map = game.getGameMap();
            promise.resolve(map);
        } catch (Exception e) {
            promise.reject("ERR", e);
        }
    }

    @ReactMethod
    public void setGameMap(ReadableMap newGameMap) {
        game.setGameMap(newGameMap);
    }

    @ReactMethod
    public void setRoleActions(ReadableMap roleActions){
        game.setRoleActions(roleActions);
    }

    @ReactMethod
    public void getRoleActions(Promise promise){
        try {
            WritableMap map = game.getRoleActions();
            promise.resolve(map);
        } catch (Exception e) {
            promise.reject("ERR", e);
        }
    }

    @ReactMethod
    public WritableMap getNextDaysGameMap(){
        return game.getNextDaysGameMap();
    }
    //==============================================================================================
}