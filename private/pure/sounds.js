/* ******************************************************************
***********************************
*** Natural: A remote desktop for embed systems.
*** By Alejandro Linarez Rangel.
*** Pure desktop sounds helper functions
***********************************
****************************************************************** */

/***************************************************************************
Copyright 2016 Alejandro Linarez Rangel

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
***************************************************************************/

var PureSoundCanPlay = true;
var PureSoundAudioVolume = 1;
var PureAllSounds = [
	{
		"name": "Freedesktop",
		"value": "sound-theme-freedesktop"
	}
];

// Sound and multimedia

// `name` is one from the freedesktop sound theme reference
// `name` is un nombre de la referencia de temas de sonido de freedesktop
function PurePlaySound(name, fcn)
{
	// We can change it later
	// Podemos cambiar el temoa de sonido luego
	var soundTheme = PureSoundTheme;
	var prefix = "/sounds/";
	var postfix = "/stereo/";
	var format = ".oga"; // MIME audio/x-vorbis+ogg
	var path = prefix + soundTheme + postfix + name + format;

	var audio = new Audio(path);
	fcn(audio);
}

function PureSoundLibPlay(name)
{
	if(PureSoundCanPlay)
	{
		PurePlaySound(name, function(audio)
		{
			audio.volume = PureSoundAudioVolume;
			audio.play();
		});
	}
}

// Natural Universal Multimedia API (NMedia)

// Plays a Freedesktop-named sound (http://0pointer.de/public/sound-naming-spec.html)
// Note: some sounds may not exist or may be in development
function NMediaPlayFreedesktopSound(name)
{
	PureSoundLibPlay(name);
}

// End
