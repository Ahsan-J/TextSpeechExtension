import React, { useEffect, useState, useMemo } from 'react';
import { IDropdownItem, Dropdown, Input } from 'forging-react';
import styles from './app.module.css';

function App() {

  const [voices, setVoices] = useState<Array<chrome.tts.TtsVoice>>();
  const [selectedVoice, setSelectedVoice] = useState<chrome.tts.TtsVoice>();
  const [defaultPitch, setDefaultPitch] = useState<number>();
  const [defaultRate, setDefaultRate] = useState<number>();

  useEffect(() => {
    const populateVoiceList = async () => {
      const _voices = (await chrome.tts.getVoices()).sort(function (a, b) {
        const aname = a.voiceName?.toUpperCase() || "";
        const bname = b.voiceName?.toUpperCase() || "";

        if (aname < bname) {
          return -1;
        } else if (aname == bname) {
          return 0;
        } else {
          return +1;
        }
      });

      chrome.storage.sync.get(["name", "lang"]).then((result) => {
        const selected = _voices.find(v => v.voiceName == result.name && v.lang == result.lang) || _voices[0];
        setSelectedVoice(selected);
      }).finally(() => {
        setVoices(_voices);
      });
    }

    populateVoiceList();

    chrome.storage.sync.get(["pitch", "rate"]).then((result) => {
      setDefaultPitch(parseFloat(result.pitch || "1"))
      setDefaultRate(parseFloat(result.rate || "1"))
    })

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }
  }, []);

  const dropdownMenu = useMemo(() => {
    if (!voices) return {};

    return voices.reduce((result, voice) => {
      result[`${voice.voiceName || ""}|${voice.lang}`] = {
        label: `${voice.voiceName || ""} (${voice.lang})`.trim()
      }
      return result;
      // eslint-disable-next-line no-unused-vars
    }, {} as { [key in string]: IDropdownItem })

  }, [voices]);

  const setActiveVoice = (key: string) => {
    const [name, lang] = key.split('|');
    chrome.storage.sync.set({ name, lang })
  }

  const setPitch: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    chrome.storage.sync.set({ "pitch": e.currentTarget.value })
    setDefaultPitch(parseFloat(e.currentTarget.value || "0"))
  }

  const setRange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    chrome.storage.sync.set({ "rate": e.currentTarget.value })
    setDefaultRate(parseFloat(e.currentTarget.value || "0.5"))
  }

  return (
    <div className={styles.main_container}>
      <h3>Configuration</h3>
      {
        typeof defaultRate == "number" ? (
          <Input htmlType='range' value={defaultRate} type='floating' label="Rate" min="0.5" max="2" defaultValue="1" step="0.1" onChange={setRange} />
        ) : null
      }

      {
        typeof defaultRate == "number" ? (
          <Input htmlType='range' value={defaultPitch} type='floating' label="Pitch" min="0" max="2" defaultValue="1" step="0.1" onChange={setPitch} />
        ) : null
      }

      <Dropdown
        className={styles.dropdown}
        label="Voice Accent"
        options={dropdownMenu}
        onItemClick={setActiveVoice}
        value={`${selectedVoice?.voiceName || ""}|${selectedVoice?.lang || ""}`}
      />
    </div>
  )
}

export default App;
