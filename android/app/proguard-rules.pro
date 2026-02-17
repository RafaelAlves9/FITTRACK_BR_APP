# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:

# FitTrack - ProGuard Rules
# Otimizado para expo-sqlite + React Native

# ============================================
# Expo SQLite - CRITICAL (não remover)
# ============================================
-keep class expo.modules.sqlite.** { *; }
-keepclassmembers class expo.modules.sqlite.** { *; }
-keep class expo.modules.sqlite.NativeDatabase { *; }
-keep class expo.modules.sqlite.NativeDatabaseModule { *; }
-keep class expo.modules.sqlite.SQLiteDatabase { *; }
-keep class expo.modules.sqlite.SQLiteModuleNext { *; }

# ============================================
# SQLite Android (nativo)
# ============================================
-keep class org.sqlite.** { *; }
-keep class org.sqlite.database.** { *; }
-keep class androidx.sqlite.** { *; }
-keep class androidx.sqlite.db.** { *; }
-keep class android.database.sqlite.** { *; }

# ============================================
# AsyncStorage (para migração)
# ============================================
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-keepclassmembers class com.reactnativecommunity.asyncstorage.** { *; }

# ============================================
# React Native Core
# ============================================
-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.modules.** { *; }

# React Native Bridge Methods
-keepclassmembers class * {
  @com.facebook.react.bridge.ReactMethod *;
  @com.facebook.react.uimanager.annotations.ReactProp *;
  @com.facebook.react.uimanager.annotations.ReactPropGroup *;
}

# ============================================
# Hermes Engine
# ============================================
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# ============================================
# Expo Modules
# ============================================
-keep class expo.modules.** { *; }
-keepclassmembers class expo.modules.** { *; }
-keep class expo.modules.core.** { *; }
-keep class expo.modules.kotlin.** { *; }

# ============================================
# Native Methods
# ============================================
-keepclasseswithmembernames class * {
  native <methods>;
}

# ============================================
# Enums
# ============================================
-keepclassmembers enum * {
  public static **[] values();
  public static ** valueOf(java.lang.String);
}

# ============================================
# Parcelables
# ============================================
-keepclassmembers class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator CREATOR;
}

# ============================================
# Serializable
# ============================================
-keepclassmembers class * implements java.io.Serializable {
  static final long serialVersionUID;
  private static final java.io.ObjectStreamField[] serialPersistentFields;
  private void writeObject(java.io.ObjectOutputStream);
  private void readObject(java.io.ObjectInputStream);
  java.lang.Object writeReplace();
  java.lang.Object readResolve();
}

# ============================================
# Keep Annotations
# ============================================
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# ============================================
# Keep Line Numbers (para debugging)
# ============================================
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ============================================
# Suppress Warnings
# ============================================
-dontwarn org.sqlite.**
-dontwarn androidx.sqlite.**
-dontwarn expo.modules.sqlite.**
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**
-dontwarn com.facebook.jni.**

# ============================================
# Otimizações adicionais
# ============================================
# Não otimizar classes do SQLite (pode causar bugs)
-keep,allowobfuscation class expo.modules.sqlite.** { *; }
-keep,allowobfuscation class org.sqlite.** { *; }

# Manter nomes de métodos nativos
-keepclasseswithmembers class * {
  native <methods>;
}