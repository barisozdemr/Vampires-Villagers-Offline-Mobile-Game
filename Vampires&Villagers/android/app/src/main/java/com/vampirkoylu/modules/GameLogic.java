package com.vampirkoylu2.modules;

import java.util.*;

public class GameLogic {

    public Random random = new Random();

    private HashMap<String, String> gameMap;
    // gameMap: ["player's name" -> "player's role"]
    private HashMap<String, LinkedList<String[]>> roleActions;
    // roleActions: (action -> action's owner, name of exposed) e.g.:
    // [kill -> ["name1", "name2"]], [heal -> ["name3", "name4"]], [lookout -> ["name5", "name6"]]
    // LinkedList[1] = action's owner, LinkedList[2] = name of exposed

    public void setCurrentDaysGameMapAndRoleActions(HashMap<String, String> gameMap, HashMap<String, LinkedList<String[]>> roleActions){
        this.gameMap = gameMap;
        this.roleActions = roleActions;
    }

    public void executeNextDay(){

        ArrayList<String> killedNames = new ArrayList<>();

        ArrayList<String> killList = new ArrayList<>();               // killed names
        ArrayList<String> healList = new ArrayList<>();               // healed names
        ArrayList<String[]> shootList = new ArrayList<>();            // hunter and shooted names
        ArrayList<String> revengeList = new ArrayList<>();            // names of revenge
        ArrayList<String[]> guardList = new ArrayList<>();            // bodyguard and guarded names
        ArrayList<String> killerList = new ArrayList<>();             // killer names

        for(Map.Entry<String, LinkedList<String[]>> entry : roleActions.entrySet()){
            if(entry.getKey().equals("kill")){
                int size = entry.getValue().size();     //linkedList size
                for(int i=0 ; i<size ; i++){
                    killList.add(entry.getValue().get(i)[1]);
                }
            }
            else if(entry.getKey().equals("heal")){
                int size = entry.getValue().size();     //linkedList size
                for(int i=0 ; i<size ; i++){
                    healList.add(entry.getValue().get(i)[1]);
                }
            }
            else if(entry.getKey().equals("shoot")){
                int size = entry.getValue().size();     //linkedList size
                for(int i=0 ; i<size ; i++){
                    shootList.add(entry.getValue().get(i));
                }
            }
            else if(entry.getKey().equals("revenge")){
                int size = entry.getValue().size();     //linkedList size
                for(int i=0 ; i<size ; i++){
                    revengeList.add(entry.getValue().get(i)[1]);
                }
            }
            else if(entry.getKey().equals("guard")){
                int size = entry.getValue().size();     //linkedList size
                for(int i=0 ; i<size ; i++){
                    guardList.add(entry.getValue().get(i));
                }
            }
            else if(entry.getKey().equals("killer")){
                int size = entry.getValue().size();     //linkedList size
                for(int i=0 ; i<size ; i++){
                    killerList.add(entry.getValue().get(i)[1]);
                }
            }
        }

        //=============================================================================================== Vampire's kill

        // ============================================================ decide kill

        int rand;
        int index;
        boolean vampireIsDead = false;

        HashMap<String, Integer> map = new HashMap<>();

        for(String isim : killList){
            if(! map.containsKey(isim)){
                map.put(isim, 1);
            }
            else{
                int count = map.get(isim) + 1;
                map.put(isim, count);
            }
        }

        String theKill = null;
        int mostVotes = 0;
        boolean tie = false;

        ArrayList<String> tieList = new ArrayList<>();

        for(Map.Entry<String, Integer> entry : map.entrySet()){
            int voteCount = entry.getValue();

            if(voteCount > mostVotes){
                theKill = entry.getKey();
                mostVotes = voteCount;
                tie = false;
                tieList.clear();
            }

            else if(voteCount == mostVotes){
                tie = true;

                if(tieList.isEmpty()){
                    tieList.add(theKill);
                }

                tieList.add(entry.getKey());
            }
        }

        if(tie){
            rand = random.nextInt(tieList.size());
            theKill = tieList.get(rand);
        }

        // ============================================================ decide killer

        map.clear();

        for(String isim : killerList){
            if(! map.containsKey(isim)){
                map.put(isim, 1);
            }
            else{
                int count = map.get(isim) + 1;
                map.put(isim, count);
            }
        }

        String theKiller = null;
        mostVotes = 0;
        tie = false;

        tieList.clear();

        for(Map.Entry<String, Integer> entry : map.entrySet()){
            int voteCount = entry.getValue();

            if(voteCount > mostVotes){
                theKiller = entry.getKey();
                mostVotes = voteCount;
                tie = false;
                tieList.clear();
            }

            else if(voteCount == mostVotes){
                tie = true;

                if(tieList.isEmpty()){
                    tieList.add(theKiller);
                }

                tieList.add(entry.getKey());
            }
        }

        if(tie){
            rand = random.nextInt(tieList.size());
            theKiller = tieList.get(rand);
        }

        // ============================================== check bodyguards guarding

        ArrayList<Integer> indexes = new ArrayList<>();  // bodyguard indexes
        for(int i=0 ; i<guardList.size() ; i++){             // check if any bodyguard guarded the victim
            if(guardList.get(i)[1].equals(theKill)){
                indexes.add(i);
            }
        }
        if(! indexes.isEmpty()){
            rand = random.nextInt(indexes.size());
            index = indexes.get(rand);
            killedNames.add(guardList.get(index)[0]);  // kill the bodyguard
            killedNames.add(theKiller);                // kill the vampire
            vampireIsDead = true;
            guardList.remove(index);
        }

        // ========================================================================
        // =================================================== check doctor healing

        if(! vampireIsDead){
            boolean isHealed = false;
            for(String healed : healList){       // check if any doctor healed the vampire's target
                if(healed.equals(theKill)){
                    isHealed = true;
                }
            }

            if(! isHealed){
                killedNames.add(theKill);
            }
        }

        // ========================================================================
        //==============================================================================================================
        //================================================================================================ Hunter's kill

        for(String[] shooting : shootList){
            String huntersName = shooting[0];  // the name of the hunter
            String shootedName = shooting[1];  // the name of the target of hunter

            indexes = new ArrayList<>();                      // bodyguard indexes
            for(int i=0 ; i<guardList.size() ; i++){          // check if any bodyguard guarded the victim
                if(guardList.get(i)[1].equals(shootedName)){
                    indexes.add(i);
                }
            }
            if(! indexes.isEmpty()){
                rand = random.nextInt(indexes.size());
                index = indexes.get(rand);
                killedNames.add(guardList.get(index)[0]);      // kill the bodyguard
                killedNames.add(huntersName);                  // kill the hunter
            }
            else{
                killedNames.add(shootedName);                  // kill the victim
                gameMap.replace(huntersName, "köylü");
                //    ???????????????????????????????????????????????????? köylüyü vurursa kendisi ölücek
                //    ????????????????????????????????????????????????????
            }
        }

        //==============================================================================================================
        //============================================================================================= Jester's revenge

        for(String revenge : revengeList){
            for(int i=0 ; i<guardList.size() ; i++){          // check if any bodyguard guarded the victim
                if(guardList.get(i)[1].equals(revenge)){
                    killedNames.add(guardList.get(i)[0]);
                }
            }

            killedNames.add(revenge);
        }

        //==============================================================================================================

        for(String name : killedNames){
            gameMap.remove(name);
        }
    }

    public HashMap<String, String> getNextDaysGameMap(){
        return gameMap;
    }

}
