import React from "react";
import { createRoot } from "react-dom/client";
import { getClosestPaletteColorForAllEmojis } from "./getClosestPaletteColorForAllEmojis";
import PALETTE from "./palette.json";
import { downloadABlob } from "./downloader.ts";
import { GeistProvider, CssBaseline } from "@geist-ui/core";
import { Card, Button, Spacer, Checkbox, Text } from "@geist-ui/core";
import VirtualGrid from "react-responsive-virtual-grid";

const OPACITY = 0.16;

// Appends a hex opacity value to a solid hex color.
// e.g. hexWithOpacity('#000000', 0.6) -> '#00000099`
function hexWithOpacity(color, value) {
  const opacityHex = Math.round(255 * value)
    .toString(16)
    .toUpperCase();
  return `${color}${opacityHex}`.padEnd(9, "0");
}

const PALETTE_OPACITY = PALETTE.map((c) => hexWithOpacity(c, OPACITY));

const emojiColors = getClosestPaletteColorForAllEmojis();
const emojiColorsEntries = Object.entries(emojiColors);

const Item = ({ style, index, data, scrolling, readyInViewport }) => {
  const [emoji, hexColor] = data[index];
  return (
    <div
      style={{
        ...style,
        display: "flex"
      }}
    >
      <div
        style={{
          height: "48px",
          minWidth: "48px",
          maxWidth: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "9999px",
          backgroundColor: PALETTE_OPACITY[PALETTE.indexOf(hexColor)]
        }}
      >
        <div
          style={{
            fontSize: "32px",
            lineHeight: "32px"
          }}
        >
          {emoji}
        </div>
      </div>
      <div
        style={{
          minWidth: "72px",
          maxWidth: "72px",
          height: "48px",
          paddingLeft: "6px",
          display: "flex",
          alignItems: "center"
        }}
      >
        <Text
          small
          b
          style={{
            color: hexColor,
            backgroundColor: hexWithOpacity(hexColor, OPACITY)
          }}
        >
          {hexColor}
        </Text>
      </div>
    </div>
  );
};

function App() {
  const [palette, setPalette] = React.useState([...PALETTE]);
  const [selectedColors, setSelectedColors] = React.useState([...PALETTE]);
  const [shuffledEntries, setShuffledEntries] = React.useState([...emojiColorsEntries]);
  const filterFn = React.useCallback(
    ([_, hexColor]) => selectedColors.includes(hexColor),
    [selectedColors]
  );
  const shuffle = React.useCallback(() => {
    setShuffledEntries(
      [...emojiColorsEntries].sort((a, b) => 0.5 - Math.random())
    );
  }, []);

  const reset = React.useCallback(() => {
    setShuffledEntries([...emojiColorsEntries]);
  }, []);
  const exportJson = React.useCallback(() => {
    downloadABlob(JSON.stringify(emojiColors), {
      fileName: "emojiColors",
      extension: ".json",
      contentType: "application/json"
    });
  }, []);

  const handleCheck = React.useCallback((values) => {
    setSelectedColors(values);
  }, []);

  const deselectAll = React.useCallback(() => {
    setSelectedColors([]);
  }, []);

  const selectAll = React.useCallback(() => {
    setSelectedColors([...palette]);
  }, [palette]);

  const shownEntries = React.useMemo(() => {
    return shuffledEntries.filter(filterFn);
  }, [filterFn, shuffledEntries]);

  const importJson = React.useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      try {
        const reader = new FileReader();
        const importedData = await new Promise((resolve, reject) => {
          reader.onload = (event) => {
            try {
              const json = JSON.parse(event.target.result);
              resolve(json);
            } catch (e) {
              reject(new Error('Invalid JSON file'));
            }
          };
          reader.onerror = reject;
          reader.readAsText(file);
        });
        
        const newEntries = Object.entries(importedData);
        // Get unique colors from imported data
        const uniqueColors = [...new Set(newEntries.map(([_, color]) => color))];
        setPalette(uniqueColors);
        setSelectedColors(uniqueColors);
        setShuffledEntries(newEntries);
      } catch (error) {
        console.error('Error importing JSON:', error);
      }
    };
    
    input.click();
  }, []);

  const importPalette = React.useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      try {
        const reader = new FileReader();
        const importedColors = await new Promise((resolve, reject) => {
          reader.onload = (event) => {
            try {
              const json = JSON.parse(event.target.result);
              resolve(json);
            } catch (e) {
              reject(new Error('Invalid JSON file'));
            }
          };
          reader.onerror = reject;
          reader.readAsText(file);
        });
        
        if (!Array.isArray(importedColors)) {
          throw new Error('Imported palette must be an array of colors');
        }
        
        setPalette(importedColors);
        setSelectedColors(importedColors);
      } catch (error) {
        console.error('Error importing palette:', error);
      }
    };
    
    input.click();
  }, []);

  return (
    <div style={{ position: "relative", padding: "0 12px" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "fixed",
          top: "10px",
          left: "0",
          right: "0",
          zIndex: "1"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Button shadow onClick={reset}>
            Sort
          </Button>
          <Spacer w={1} />
          <Button shadow onClick={shuffle}>
            Shuffle
          </Button>
          <Spacer w={1} />
          <Button shadow onClick={exportJson}>
            Export JSON
          </Button>
          <Spacer w={1} />
          <Button shadow onClick={importJson}>
            Import JSON
          </Button>
          <Spacer w={1} />
          <Button shadow onClick={importPalette}>
            Import Palette
          </Button>
        </div>
      </div>
      <div style={{ height: "60px", width: "100%" }} />
      <Card style={{ marginBottom: "10px" }}>
        <Checkbox.Group value={selectedColors} onChange={handleCheck}>
          {palette.map((hexColor) => (
            <Checkbox key={hexColor} value={hexColor}>
              <Text
                small
                b
                style={{
                  color: hexColor,
                  backgroundColor: hexWithOpacity(hexColor, OPACITY)
                }}
              >
                {hexColor}
              </Text>
            </Checkbox>
          ))}
        </Checkbox.Group>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "10px"
          }}
        >
          <Button onClick={selectAll}>Select All</Button>
          <Spacer w={1} />
          <Button onClick={deselectAll}>Deselect All</Button>
        </div>
      </Card>

      <VirtualGrid
        total={shownEntries.length}
        cell={{ height: 56, width: 120 }}
        child={Item}
        childProps={{ data: shownEntries }}
        viewportRowOffset={10}
      />
    </div>
  );
}

function AppContainer() {
  return (
    <GeistProvider>
      <CssBaseline />
      <App />
    </GeistProvider>
  );
}

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(<AppContainer />);
