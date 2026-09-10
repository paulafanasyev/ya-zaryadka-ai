import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  PanResponder,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationParams } from '../../types';

type CreativityScreenProps = {
  navigation: StackNavigationProp<NavigationParams, 'Creativity'>;
};

interface Point {
  x: number;
  y: number;
}

export default function CreativityScreen({ navigation }: CreativityScreenProps) {
  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  
  const canvasRef = useRef<View>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath([{ x: locationX, y: locationY }]);
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath([...currentPath, { x: locationX, y: locationY }]);
    },
    onPanResponderRelease: () => {
      if (currentPath.length > 0) {
        setPaths([...paths, currentPath]);
      }
      setCurrentPath([]);
    },
  });

  const clearCanvas = () => {
    Alert.alert(
      'Очистить рисунок?',
      'Ты уверен? Рисунок будет удалён.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Да', 
          style: 'destructive',
          onPress: () => {
            setPaths([]);
            setCurrentPath([]);
          }
        },
      ]
    );
  };

  const saveDrawing = () => {
    // In production, this would convert paths to image and save
    Alert.alert(
      'Рисунок сохранён! 🎨',
      'Твой шедевр сохранён в галерее!',
      [{ text: 'Ура!' }]
    );
    navigation.navigate('World');
  };

  const colors = [
    '#000000', '#FFFFFF', '#FF6B6B', '#4ECDC4',
    '#FFE66D', '#95E1D3', '#F38181', '#AA96DA',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Творчество 🎨</Text>
        <TouchableOpacity onPress={saveDrawing} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>💾 Сохранить</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.canvasContainer}>
        <View
          ref={canvasRef}
          style={[styles.canvas, { backgroundColor: '#fff' }]}
          {...panResponder.panHandlers}
        >
          {/* Render saved paths */}
          {paths.map((path, pathIndex) => (
            <View key={pathIndex} style={styles.pathContainer}>
              {path.map((point, pointIndex) => (
                <View
                  key={pointIndex}
                  style={[
                    styles.dot,
                    {
                      left: point.x - brushSize / 2,
                      top: point.y - brushSize / 2,
                      width: brushSize,
                      height: brushSize,
                      backgroundColor: selectedColor,
                    },
                  ]}
                />
              ))}
            </View>
          ))}
          
          {/* Render current path */}
          {currentPath.map((point, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  left: point.x - brushSize / 2,
                  top: point.y - brushSize / 2,
                  width: brushSize,
                  height: brushSize,
                  backgroundColor: selectedColor,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.colorPicker}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColor,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>

        <View style={styles.brushSizes}>
          {[3, 5, 10, 15].map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeOption,
                { width: size * 2, height: size * 2 },
                brushSize === size && styles.selectedSize,
              ]}
              onPress={() => setBrushSize(size)}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={clearCanvas}>
            <Text style={styles.actionButtonText}>🗑️ Очистить</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  canvasContainer: {
    flex: 1,
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  canvas: {
    flex: 1,
    position: 'relative',
  },
  pathContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dot: {
    position: 'absolute',
    borderRadius: 10,
  },
  toolbar: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  colorOption: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedColor: {
    borderColor: '#333',
    borderWidth: 3,
  },
  brushSizes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  sizeOption: {
    backgroundColor: '#333',
    borderRadius: 10,
  },
  selectedSize: {
    backgroundColor: '#4CAF50',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFCDD2',
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '600',
  },
});
