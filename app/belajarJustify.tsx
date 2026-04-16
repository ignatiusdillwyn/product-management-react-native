import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";

export default function Index() {
  const [justifyValue, setJustifyValue] = useState<"flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly">("center");
  const [alignValue, setAlignValue] = useState<"flex-start" | "center" | "flex-end" | "stretch">("center");

  // Pilihan untuk justifyContent (vertikal)
  const justifyOptions = [
    { label: "flex-start", value: "flex-start" }, // atas
    { label: "center", value: "center" },         // tengah
    { label: "flex-end", value: "flex-end" },     // bawah
    { label: "space-between", value: "space-between" }, // rata kiri-kanan
    { label: "space-around", value: "space-around" },   // spacing merata
    { label: "space-evenly", value: "space-evenly" },   // spacing sama rata
  ];

  // Pilihan untuk alignItems (horizontal)
  const alignOptions = [
    { label: "flex-start", value: "flex-start" }, // kiri
    { label: "center", value: "center" },         // tengah
    { label: "flex-end", value: "flex-end" },     // kanan
    { label: "stretch", value: "stretch" },       // melebar
  ];

  const setButtonColorFunc = (option:any) => {
    if (justifyValue === option.value) {
      return "blue";
    } else {
      return "#ccc";
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Belajar justifyContent & alignItems
        </Text>
        
        {/* Container Demo */}
        <View
          style={{
            height: 400,
            backgroundColor: "#e0e0e0",
            // flexDirection: "column",
            justifyContent: justifyValue,
            alignItems: alignValue,
            marginBottom: 20,
            borderWidth: 2,
            borderColor: "#333",
          }}
        >
          {/* Item 1 */}
          <View
            style={{
              width: 80,
              height: 80,
              backgroundColor: "red",
              margin: 5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white" }}>Item 1</Text>
          </View>
          
          {/* Item 2 */}
          <View
            style={{
              width: 80,
              height: 80,
              backgroundColor: "green",
              margin: 5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white" }}>Item 2</Text>
          </View>
          
          {/* Item 3 */}
          <View
            style={{
              width: 80,
              height: 80,
              backgroundColor: "blue",
              margin: 5,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white" }}>Item 3</Text>
          </View>
        </View>

        {/* Kontrol justifyContent */}
        <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>
          justifyContent (Vertical): {justifyValue}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 5 }}>
          {justifyOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setJustifyValue(option.value as "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly")}
              style={{
                backgroundColor: justifyValue === option.value ? "blue" : "#ccc",
                // backgroundColor: setButtonColorFunc(option),
                padding: 8,
                margin: 4,
                borderRadius: 5,
              }}
            >
              <Text style={{ color: "white" }}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Kontrol alignItems */}
        <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 15 }}>
          alignItems (Horizontal): {alignValue}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 5 }}>
          {alignOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setAlignValue(option.value as "flex-start" | "center" | "flex-end" | "stretch")}
              style={{
                backgroundColor: alignValue === option.value ? "blue" : "#ccc",
                padding: 8,
                margin: 4,
                borderRadius: 5,
              }}
            >
              <Text style={{ color: "white" }}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Penjelasan */}
        <View style={{ marginTop: 20, padding: 15, backgroundColor: "#fff", borderRadius: 10 }}>
          <Text style={{ fontWeight: "bold" }}>📝 Penjelasan:</Text>
          <Text style={{ marginTop: 5 }}>
            • justifyContent = "{justifyValue}" → mengatur posisi VERTIKAL
          </Text>
          <Text>• alignItems = "{alignValue}" → mengatur posisi HORIZONTAL</Text>
          <Text style={{ marginTop: 10, fontStyle: "italic" }}>
            💡 Tips: Coba klik tombol di atas dan lihat perubahan posisi 3 kotak berwarna!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}