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
