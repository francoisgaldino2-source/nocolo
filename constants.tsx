import React from 'react';
import { Product } from './types';

// Link da imagem do logo
// Dica: Se a imagem não carregar, use o "Link Direto" do ImgBB (ex: https://i.ibb.co/...)
export const APP_LOGO = "https://i.ibb.co/wFvKKW9z/Gemini-Generated-Image-gqe5p3gqe5p3gqe5-1.png";

export const QUOTES = [
  "Você está fazendo o seu melhor. Seu bebê sente seu amor.",
  "Respire fundo. Esse momento vai passar, mas o amor fica.",
  "Maternidade é uma jornada, não uma corrida.",
  "Confie no seu instinto, mamãe. Você conhece seu bebê.",
  "Cuidar de você também é cuidar do seu bebê."
];

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Macacão Algodão Pima', price: 89.90, category: 'Roupa', minAgeMonths: 0, maxAgeMonths: 3, image: 'https://picsum.photos/200/200?random=1' },
  { id: '2', name: 'Naninha de Ovelha', price: 45.00, category: 'Brinquedo', minAgeMonths: 0, maxAgeMonths: 12, image: 'https://picsum.photos/200/200?random=2' },
  { id: '3', name: 'Mordedor Sensorial', price: 32.50, category: 'Brinquedo', minAgeMonths: 3, maxAgeMonths: 12, image: 'https://picsum.photos/200/200?random=3' },
  { id: '4', name: 'Copo de Transição', price: 55.00, category: 'Alimentação', minAgeMonths: 6, maxAgeMonths: 24, image: 'https://picsum.photos/200/200?random=4' },
  { id: '5', name: 'Tapete de Atividades', price: 250.00, category: 'Brinquedo', minAgeMonths: 2, maxAgeMonths: 12, image: 'https://picsum.photos/200/200?random=5' },
];

export const MILESTONES: Record<string, string[]> = {
  '0-1': ['Foca a visão a 20-30cm', 'Reconhece a voz da mãe', 'Movimentos reflexos'],
  '2-3': ['Começa a sorrir socialmente', 'Sustenta a cabeça por instantes', 'Acompanha objetos com o olhar'],
  '4-6': ['Rola de bruços', 'Leva objetos à boca', 'Começa a introdução alimentar (6m)'],
  '7-9': ['Senta sem apoio', 'Engatinha ou se arrasta', 'Estranha desconhecidos'],
  '10-12': ['Fica de pé com apoio', 'Fala "mamã", "papá"', 'Bate palminhas'],
};

// Formato: Min Horas Sono, Max Horas Sono, Min Mamadas, Max Mamadas
export const DAILY_GOALS: Record<string, { sleepMin: number, sleepMax: number, feedsMin: number, feedsMax: number }> = {
    '0-3': { sleepMin: 14, sleepMax: 17, feedsMin: 8, feedsMax: 12 },
    '4-11': { sleepMin: 12, sleepMax: 15, feedsMin: 6, feedsMax: 8 },
    '12-24': { sleepMin: 11, sleepMax: 14, feedsMin: 4, feedsMax: 6 },
    '25+': { sleepMin: 10, sleepMax: 13, feedsMin: 3, feedsMax: 5 },
};

// Simplified WHO Standards (approximate kg)
// Format: [min (-2SD), median, max (+2SD)]
export const GROWTH_DATA_BOY: Record<number, number[]> = {
  0: [2.5, 3.3, 4.4],
  1: [3.4, 4.5, 5.8],
  2: [4.3, 5.6, 7.1],
  3: [5.0, 6.4, 8.0],
  4: [5.6, 7.0, 8.7],
  5: [6.0, 7.5, 9.3],
  6: [6.4, 7.9, 9.8],
  7: [6.7, 8.3, 10.3],
  8: [6.9, 8.6, 10.7],
  9: [7.1, 8.9, 11.0],
  10: [7.4, 9.2, 11.4],
  11: [7.6, 9.4, 11.7],
  12: [7.7, 9.6, 12.0],
};

export const GROWTH_DATA_GIRL: Record<number, number[]> = {
  0: [2.4, 3.2, 4.2],
  1: [3.2, 4.2, 5.5],
  2: [3.9, 5.1, 6.6],
  3: [4.5, 5.8, 7.5],
  4: [5.0, 6.4, 8.2],
  5: [5.4, 6.9, 8.8],
  6: [5.7, 7.3, 9.3],
  7: [6.0, 7.6, 9.8],
  8: [6.3, 7.9, 10.2],
  9: [6.5, 8.2, 10.5],
  10: [6.7, 8.5, 10.9],
  11: [6.9, 8.7, 11.2],
  12: [7.0, 8.9, 11.5],
};