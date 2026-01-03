package com.tutorsudoku

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.gms.games.PlayGames
import com.google.android.gms.games.PlayGamesSdk
import com.google.android.gms.games.leaderboard.LeaderboardVariant
import com.google.android.gms.games.leaderboard.LeaderboardScore

class PlayGamesModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "PlayGames"
    }

    @ReactMethod
    fun init(promise: Promise) {
        val activity: Activity? = reactContext.currentActivity

        if (activity == null) {
            promise.reject("ACTIVITY_NULL", "Activity is null")
            return
        }

        try {
            PlayGamesSdk.initialize(activity)

            PlayGames.getGamesSignInClient(activity)
                .isAuthenticated
                .addOnSuccessListener { isAuthenticated ->
                    if (isAuthenticated.isAuthenticated) {
                        promise.resolve(true)
                    } else {
                        promise.resolve(false)
                    }
                }
                .addOnFailureListener { e ->
                    promise.reject("SIGN_IN_ERROR", e.message)
                }
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", e.message)
        }
    }

    @ReactMethod
    fun submitScore(leaderboardId: String, score: Int) {
        val activity: Activity? = reactContext.currentActivity
        
        if (activity != null) {
            PlayGames.getLeaderboardsClient(activity)
                .submitScore(leaderboardId, score.toLong())
            Log.d("PlayGames", "Score submitted: $score")
        }
    }

    @ReactMethod
    fun showLeaderboard(leaderboardId: String, promise: Promise) {
        val activity: Activity? = reactContext.currentActivity
        
        if (activity == null) {
            promise.reject("ACTIVITY_NULL", "Activity is null")
            return
        }

        PlayGames.getLeaderboardsClient(activity)
            .getLeaderboardIntent(leaderboardId)
            .addOnSuccessListener { intent ->
                activity.startActivityForResult(intent, 9004)
                promise.resolve(null)
            }
            .addOnFailureListener { e ->
                promise.reject("LEADERBOARD_ERROR", e.message)
            }
    }

    @ReactMethod
    fun showAllLeaderboards(promise: Promise) {
        val activity: Activity? = reactContext.currentActivity
        
        if (activity == null) {
            promise.reject("ACTIVITY_NULL", "Activity is null")
            return
        }

        PlayGames.getLeaderboardsClient(activity)
            .allLeaderboardsIntent
            .addOnSuccessListener { intent ->
                activity.startActivityForResult(intent, 9004)
                promise.resolve(null)
            }
            .addOnFailureListener { e ->
                promise.reject("LEADERBOARD_ERROR", e.message)
            }
    }

    @ReactMethod
    fun getMyScore(leaderboardId: String, promise: Promise) {
        val activity: Activity? = reactContext.currentActivity
        if (activity == null) {
            promise.resolve(0)
            return
        }

        PlayGames.getLeaderboardsClient(activity)
            .loadCurrentPlayerLeaderboardScore(
                leaderboardId,
                LeaderboardVariant.TIME_SPAN_ALL_TIME,
                LeaderboardVariant.COLLECTION_PUBLIC
            )
            .addOnSuccessListener { annotatedData ->
                val scoreBuffer = annotatedData.get()
                if (scoreBuffer != null) {
                    val rawScore = scoreBuffer.rawScore
                    promise.resolve(rawScore.toDouble())
                } else {
                    promise.resolve(0.0)
                }
            }
            .addOnFailureListener {
                promise.resolve(0.0)
            }
    }
}