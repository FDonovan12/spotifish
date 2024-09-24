
from __future__ import unicode_literals

import yt_dlp
import json
import re
import os
from mutagen.mp3 import MP3
import math
import unicodedata

def slugify(originalTitle):
    lowercaseFilename = originalTitle.lower()
    whitoutMultipleSpace = re.sub('[^a-z0-9]+', ' ', lowercaseFilename)
    strippedFilename = whitoutMultipleSpace.strip()
    slugifyFilename = strippedFilename.replace(" ", "-")
    normalizedTitle = unicodedata.normalize('NFKC', originalTitle)
    
    # Convertit en minuscules (optionnel pour les caractères non latins)
    lowercaseFilename = normalizedTitle.lower()
    
    # Remplace tous les caractères indésirables sauf les lettres, chiffres, espaces et caractères non latins
    # Utilisez '[^\w\s-]' si vous voulez aussi conserver les traits d'union
    slugifiedFilename = re.sub(r'[^\w\s-]', '', lowercaseFilename)
    
    # Remplace les espaces multiples par un seul espace
    slugifiedFilename = re.sub(r'\s+', ' ', slugifiedFilename).strip()
    
    # Remplace les espaces par des traits d'union
    slugifiedFilename = slugifiedFilename.replace(" ", "-")
    slugifiedFilename = re.sub("[-]+", "-", slugifiedFilename)
    
    return slugifiedFilename
    return slugifyFilename

def extract_title(youtube_url):
    with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
        info_dict = ydl.extract_info(youtube_url, download=False)
        title = info_dict.get('title', 'unknown_title')
        print(f'\n {title = }')
        
        custom_filename = slugify(title)
        print(f'\n {custom_filename = }')
        return custom_filename

def download_one_music(youtube_url):
    print("download_one_music")
    custom_filename = extract_title(youtube_url)
    path_for_json = os.path.join('current/music/', custom_filename + ".mp3")
    download_path = os.path.join("./../current/music/" , custom_filename)
    if os.path.exists(download_path + ".mp3"):
        print("File already exists")
        return path_for_json
        
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': download_path,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(youtube_url, download=True)
    return path_for_json

def download_all_musics(jsonFileName):
    f = open(jsonFileName)
    data = json.load(f)

    blindtest = data["blindtest"]
    sections = blindtest["sections"]
    for section in sections:
        musics = section["musics"]
        for music in musics:
            try:
                try:
                    oldPath = music["path"]
                except:
                    print("path no exist")
                    oldPath = ""
                newPath = download_one_music(music["link"])
                if oldPath != newPath and os.path.exists("./../"+oldPath) and oldPath != "":
                    os.remove("./../"+oldPath)
                
                music["path"] = newPath
                audio = MP3("./../"+newPath)
                duration = math.ceil(audio.info.length)
                music["duration"] = duration
                
                
            except:
                print("error occured and was catch")
                print(f'{music = }')
                
    with open(jsonFileName, "w") as jsonFile:
        json.dump(data, jsonFile, ensure_ascii=False)
    f.close()
    jsonFile.close()

filename = "./../current/data.json"
# filename = "./../current/testdata.json"
download_all_musics(filename)