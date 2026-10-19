import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Base de dados de alimentos portugueses - Tabela INSA
const portugueseFoods = [
  // Cereais e Derivados
  { name: 'Pão de trigo branco', category: 'Cereais', cal: 265, prot: 8.0, carb: 52.0, fat: 1.5, fib: 2.5 },
  { name: 'Pão de trigo integral', category: 'Cereais', cal: 250, prot: 9.0, carb: 48.0, fat: 1.8, fib: 6.0 },
  { name: 'Pão de milho', category: 'Cereais', cal: 280, prot: 6.5, carb: 55.0, fat: 2.5, fib: 4.0 },
  { name: 'Pão de centeio', category: 'Cereais', cal: 240, prot: 8.5, carb: 45.0, fat: 1.2, fib: 7.5 },
  { name: 'Flocos de aveia', category: 'Cereais', cal: 368, prot: 13.5, carb: 58.7, fat: 7.0, fib: 10.0 },
  { name: 'Arroz branco cozido', category: 'Cereais', cal: 130, prot: 2.7, carb: 28.7, fat: 0.3, fib: 0.4 },
  { name: 'Arroz integral cozido', category: 'Cereais', cal: 111, prot: 2.6, carb: 23.0, fat: 0.9, fib: 1.8 },
  { name: 'Massa cozida', category: 'Cereais', cal: 131, prot: 5.0, carb: 25.0, fat: 1.1, fib: 1.5 },
  { name: 'Massa integral cozida', category: 'Cereais', cal: 124, prot: 4.5, carb: 24.0, fat: 0.8, fib: 3.5 },
  { name: 'Branco de trigo', category: 'Cereais', cal: 340, prot: 12.0, carb: 70.0, fat: 1.5, fib: 3.0 },
  { name: 'Branco de milho', category: 'Cereais', cal: 360, prot: 8.0, carb: 75.0, fat: 4.0, fib: 7.5 },
  { name: 'Papa de aveia (50g aveia + 200ml leite)', category: 'Cereais', cal: 180, prot: 8.0, carb: 25.0, fat: 5.0, fib: 4.0 },

  // Frutas
  { name: 'Maçã', category: 'Fruta', cal: 52, prot: 0.3, carb: 13.8, fat: 0.2, fib: 2.4 },
  { name: 'Pera', category: 'Fruta', cal: 57, prot: 0.4, carb: 15.2, fat: 0.1, fib: 3.1 },
  { name: 'Banana', category: 'Fruta', cal: 89, prot: 1.1, carb: 22.8, fat: 0.3, fib: 2.6 },
  { name: 'Laranja', category: 'Fruta', cal: 47, prot: 0.9, carb: 11.8, fat: 0.1, fib: 2.4 },
  { name: 'Tangerina', category: 'Fruta', cal: 53, prot: 0.8, carb: 13.3, fat: 0.3, fib: 1.8 },
  { name: 'Limão', category: 'Fruta', cal: 29, prot: 1.1, carb: 9.3, fat: 0.3, fib: 2.8 },
  { name: 'Uva', category: 'Fruta', cal: 69, prot: 0.7, carb: 18.1, fat: 0.2, fib: 0.9 },
  { name: 'Morango', category: 'Fruta', cal: 32, prot: 0.7, carb: 7.7, fat: 0.3, fib: 2.0 },
  { name: 'Melancia', category: 'Fruta', cal: 30, prot: 0.6, carb: 7.6, fat: 0.2, fib: 0.4 },
  { name: 'Melão', category: 'Fruta', cal: 34, prot: 0.8, carb: 8.2, fat: 0.2, fib: 0.9 },
  { name: 'Pêssego', category: 'Fruta', cal: 39, prot: 0.9, carb: 9.5, fat: 0.3, fib: 1.5 },
  { name: 'Nectarina', category: 'Fruta', cal: 44, prot: 1.1, carb: 10.6, fat: 0.3, fib: 1.7 },
  { name: 'Kiwi', category: 'Fruta', cal: 61, prot: 1.1, carb: 14.7, fat: 0.5, fib: 3.0 },
  { name: 'Ananás', category: 'Fruta', cal: 50, prot: 0.5, carb: 13.0, fat: 0.1, fib: 1.4 },
  { name: 'Manga', category: 'Fruta', cal: 60, prot: 0.8, carb: 15.0, fat: 0.4, fib: 1.6 },
  { name: 'Ameixa', category: 'Fruta', cal: 46, prot: 0.7, carb: 11.4, fat: 0.3, fib: 1.4 },
  { name: 'Cereja', category: 'Fruta', cal: 50, prot: 1.1, carb: 12.0, fat: 0.3, fib: 1.6 },
  { name: 'Figo', category: 'Fruta', cal: 74, prot: 0.8, carb: 19.2, fat: 0.3, fib: 2.9 },
  { name: 'Romã', category: 'Fruta', cal: 83, prot: 1.7, carb: 19.0, fat: 1.2, fib: 4.0 },
  { name: 'Frutos vermelhos (framboesa, mirtilo, etc)', category: 'Fruta', cal: 35, prot: 0.7, carb: 8.5, fat: 0.3, fib: 4.0 },

  // Legumes
  { name: 'Brócolos', category: 'Legumes', cal: 34, prot: 2.8, carb: 7.0, fat: 0.4, fib: 2.6 },
  { name: 'Couve-flor', category: 'Legumes', cal: 25, prot: 2.0, carb: 5.0, fat: 0.3, fib: 2.0 },
  { name: 'Espinafres', category: 'Legumes', cal: 23, prot: 2.9, carb: 3.6, fat: 0.4, fib: 2.2 },
  { name: 'Alface', category: 'Legumes', cal: 15, prot: 1.4, carb: 2.9, fat: 0.2, fib: 1.3 },
  { name: 'Tomate', category: 'Legumes', cal: 18, prot: 0.9, carb: 3.9, fat: 0.2, fib: 1.2 },
  { name: 'Cenoura', category: 'Legumes', cal: 41, prot: 0.9, carb: 9.6, fat: 0.2, fib: 2.8 },
  { name: 'Batata', category: 'Legumes', cal: 77, prot: 2.0, carb: 17.0, fat: 0.1, fib: 2.2 },
  { name: 'Batata-doce', category: 'Legumes', cal: 86, prot: 1.6, carb: 20.0, fat: 0.1, fib: 3.0 },
  { name: 'Cebola', category: 'Legumes', cal: 40, prot: 1.1, carb: 9.3, fat: 0.1, fib: 1.7 },
  { name: 'Alho', category: 'Legumes', cal: 149, prot: 6.4, carb: 33.1, fat: 0.5, fib: 2.1 },
  { name: 'Pimento verde', category: 'Legumes', cal: 20, prot: 0.9, carb: 4.6, fat: 0.2, fib: 1.7 },
  { name: 'Pimento vermelho', category: 'Legumes', cal: 31, prot: 1.0, carb: 6.0, fat: 0.3, fib: 2.1 },
  { name: 'Pimento amarelo', category: 'Legumes', cal: 27, prot: 1.0, carb: 5.8, fat: 0.2, fib: 1.9 },
  { name: 'Abóbora', category: 'Legumes', cal: 26, prot: 1.0, carb: 6.5, fat: 0.1, fib: 0.5 },
  { name: 'Abobrinha', category: 'Legumes', cal: 17, prot: 1.2, carb: 3.1, fat: 0.3, fib: 1.0 },
  { name: 'Beringela', category: 'Legumes', cal: 25, prot: 1.0, carb: 5.9, fat: 0.2, fib: 3.0 },
  { name: 'Courgete', category: 'Legumes', cal: 17, prot: 1.2, carb: 3.1, fat: 0.3, fib: 1.0 },
  { name: 'Nabo', category: 'Legumes', cal: 28, prot: 0.9, carb: 6.4, fat: 0.1, fib: 1.8 },
  { name: 'Rúcula', category: 'Legumes', cal: 25, prot: 2.6, carb: 3.7, fat: 0.7, fib: 1.6 },
  { name: 'Agrião', category: 'Legumes', cal: 22, prot: 2.3, carb: 3.7, fat: 0.5, fib: 2.0 },
  { name: 'Feijão verde', category: 'Legumes', cal: 31, prot: 1.8, carb: 7.1, fat: 0.1, fib: 2.7 },
  { name: 'Ervilhas', category: 'Legumes', cal: 81, prot: 5.4, carb: 14.5, fat: 0.4, fib: 5.7 },
  { name: 'Cogumelos', category: 'Legumes', cal: 22, prot: 3.1, carb: 3.3, fat: 0.3, fib: 1.0 },

  // Carnes
  { name: 'Frango (peito) grelhado', category: 'Carnes', cal: 165, prot: 31.0, carb: 0.0, fat: 3.6, fib: 0.0 },
  { name: 'Frango (coxa) grelhada', category: 'Carnes', cal: 185, prot: 24.0, carb: 0.0, fat: 8.5, fib: 0.0 },
  { name: 'Peru grelhado', category: 'Carnes', cal: 135, prot: 30.0, carb: 0.0, fat: 1.5, fib: 0.0 },
  { name: 'Vaca (alcatra) grelhada', category: 'Carnes', cal: 150, prot: 26.0, carb: 0.0, fat: 5.0, fib: 0.0 },
  { name: 'Vaca (lombo) grelhada', category: 'Carnes', cal: 170, prot: 25.0, carb: 0.0, fat: 7.5, fib: 0.0 },
  { name: 'Porco (lombo) grelhado', category: 'Carnes', cal: 165, prot: 24.0, carb: 0.0, fat: 7.5, fib: 0.0 },
  { name: 'Porco (costeleta) grelhada', category: 'Carnes', cal: 240, prot: 22.0, carb: 0.0, fat: 16.0, fib: 0.0 },
  { name: 'Coelho estufado', category: 'Carnes', cal: 145, prot: 22.0, carb: 0.0, fat: 6.0, fib: 0.0 },
  { name: 'Vitela grelhada', category: 'Carnes', cal: 155, prot: 27.0, carb: 0.0, fat: 5.5, fib: 0.0 },
  { name: 'Bacon', category: 'Carnes', cal: 541, prot: 37.0, carb: 1.4, fat: 42.0, fib: 0.0 },
  { name: 'Presunto', category: 'Carnes', cal: 145, prot: 21.0, carb: 0.5, fat: 6.0, fib: 0.0 },
  { name: 'Chouriço', category: 'Carnes', cal: 323, prot: 18.0, carb: 3.0, fat: 27.0, fib: 0.0 },
  { name: 'Farinheira', category: 'Carnes', cal: 280, prot: 14.0, carb: 8.0, fat: 22.0, fib: 0.0 },
  { name: 'Enchidos variados', category: 'Carnes', cal: 350, prot: 15.0, carb: 2.0, fat: 32.0, fib: 0.0 },

  // Peixes
  { name: 'Salmão grelhado', category: 'Peixes', cal: 208, prot: 20.0, carb: 0.0, fat: 13.0, fib: 0.0 },
  { name: 'Atum fresco grelhado', category: 'Peixes', cal: 144, prot: 28.0, carb: 0.0, fat: 4.0, fib: 0.0 },
  { name: 'Atum em conserva (natural)', category: 'Peixes', cal: 116, prot: 26.0, carb: 0.0, fat: 1.0, fib: 0.0 },
  { name: 'Bacalhau cozido', category: 'Peixes', cal: 82, prot: 18.0, carb: 0.0, fat: 0.7, fib: 0.0 },
  { name: 'Dourada grelhada', category: 'Peixes', cal: 96, prot: 20.0, carb: 0.0, fat: 1.5, fib: 0.0 },
  { name: 'Robalo grelhado', category: 'Peixes', cal: 106, prot: 20.0, carb: 0.0, fat: 2.5, fib: 0.0 },
  { name: 'Pescada cozida', category: 'Peixes', cal: 85, prot: 18.0, carb: 0.0, fat: 0.9, fib: 0.0 },
  { name: 'Carapau grelhado', category: 'Peixes', cal: 91, prot: 19.0, carb: 0.0, fat: 1.5, fib: 0.0 },
  { name: 'Sardinha grelhada', category: 'Peixes', cal: 208, prot: 25.0, carb: 0.0, fat: 11.0, fib: 0.0 },
  { name: 'Cavala grelhada', category: 'Peixes', cal: 194, prot: 23.0, carb: 0.0, fat: 10.0, fib: 0.0 },
  { name: 'Raia grelhada', category: 'Peixes', cal: 91, prot: 18.0, carb: 0.0, fat: 1.5, fib: 0.0 },
  { name: 'Polvo cozido', category: 'Peixes', cal: 86, prot: 14.0, carb: 0.0, fat: 1.5, fib: 0.0 },
  { name: 'Lulas grelhadas', category: 'Peixes', cal: 92, prot: 16.0, carb: 0.0, fat: 1.5, fib: 0.0 },
  { name: 'Camarão', category: 'Peixes', cal: 99, prot: 24.0, carb: 0.2, fat: 0.3, fib: 0.0 },
  { name: 'Lagostim', category: 'Peixes', cal: 77, prot: 16.0, carb: 0.0, fat: 0.5, fib: 0.0 },
  { name: 'Mexilhão', category: 'Peixes', cal: 86, prot: 12.0, carb: 4.0, fat: 2.2, fib: 0.0 },
  { name: 'Ameijoa', category: 'Peixes', cal: 82, prot: 12.0, carb: 4.5, fat: 1.5, fib: 0.0 },

  // Laticínios
  { name: 'Leite de vaca (integral)', category: 'Laticínios', cal: 61, prot: 3.2, carb: 4.8, fat: 3.3, fib: 0.0 },
  { name: 'Leite de vaca (meio-gordo)', category: 'Laticínios', cal: 46, prot: 3.3, carb: 4.8, fat: 1.5, fib: 0.0 },
  { name: 'Leite de vaca (magro)', category: 'Laticínios', cal: 34, prot: 3.4, carb: 4.9, fat: 0.1, fib: 0.0 },
  { name: 'Iogurte natural (integral)', category: 'Laticínios', cal: 65, prot: 4.0, carb: 5.0, fat: 3.5, fib: 0.0 },
  { name: 'Iogurte natural (magro)', category: 'Laticínios', cal: 48, prot: 5.2, carb: 4.8, fat: 0.2, fib: 0.0 },
  { name: 'Queijo fresco (magro)', category: 'Laticínios', cal: 78, prot: 12.0, carb: 3.5, fat: 1.5, fib: 0.0 },
  { name: 'Queijo fresco (gordo)', category: 'Laticínios', cal: 130, prot: 10.0, carb: 3.0, fat: 9.0, fib: 0.0 },
  { name: 'Queijo flamengo', category: 'Laticínios', cal: 320, prot: 25.0, carb: 0.5, fat: 25.0, fib: 0.0 },
  { name: 'Queijo da Ilha', category: 'Laticínios', cal: 380, prot: 22.0, carb: 0.5, fat: 32.0, fib: 0.0 },
  { name: 'Queijo Serra da Estrela', category: 'Laticínios', cal: 350, prot: 23.0, carb: 0.5, fat: 28.0, fib: 0.0 },
  { name: 'Queijo Azeitão', category: 'Laticínios', cal: 340, prot: 24.0, carb: 0.5, fat: 27.0, fib: 0.0 },
  { name: 'Queijo Mozzarella', category: 'Laticínios', cal: 280, prot: 22.0, carb: 0.5, fat: 22.0, fib: 0.0 },
  { name: 'Requeijão', category: 'Laticínios', cal: 120, prot: 11.0, carb: 4.0, fat: 7.0, fib: 0.0 },
  { name: 'Manteiga', category: 'Laticínios', cal: 717, prot: 0.9, carb: 0.1, fat: 81.0, fib: 0.0 },
  { name: 'Nata (30%)', category: 'Laticínios', cal: 300, prot: 2.0, carb: 3.0, fat: 30.0, fib: 0.0 },

  // Ovos
  { name: 'Ovo cozido (M)', category: 'Ovos', cal: 155, prot: 12.6, carb: 1.1, fat: 10.6, fib: 0.0 },
  { name: 'Ovo estrelado', category: 'Ovos', cal: 175, prot: 12.5, carb: 1.0, fat: 13.5, fib: 0.0 },
  { name: 'Ovo mexido', category: 'Ovos', cal: 165, prot: 12.5, carb: 1.0, fat: 12.5, fib: 0.0 },
  { name: 'Clara de ovo', category: 'Ovos', cal: 52, prot: 10.9, carb: 0.7, fat: 0.2, fib: 0.0 },
  { name: 'Gema de ovo', category: 'Ovos', cal: 322, prot: 16.0, carb: 3.5, fat: 27.0, fib: 0.0 },

  // Gorduras e Óleos
  { name: 'Azeite virgem extra', category: 'Gorduras', cal: 884, prot: 0.0, carb: 0.0, fat: 100.0, fib: 0.0 },
  { name: 'Óleo de girassol', category: 'Gorduras', cal: 884, prot: 0.0, carb: 0.0, fat: 100.0, fib: 0.0 },
  { name: 'Óleo de milho', category: 'Gorduras', cal: 884, prot: 0.0, carb: 0.0, fat: 100.0, fib: 0.0 },
  { name: 'Banha de porco', category: 'Gorduras', cal: 902, prot: 0.0, carb: 0.0, fat: 100.0, fib: 0.0 },

  // Frutos Secos e Sementes
  { name: 'Amêndoas', category: 'Frutos Secos', cal: 579, prot: 21.2, carb: 21.6, fat: 49.9, fib: 12.5 },
  { name: 'Nozes', category: 'Frutos Secos', cal: 654, prot: 15.2, carb: 13.7, fat: 65.2, fib: 6.7 },
  { name: 'Avelãs', category: 'Frutos Secos', cal: 628, prot: 14.1, carb: 16.7, fat: 60.8, fib: 9.7 },
  { name: 'Cajus', category: 'Frutos Secos', cal: 553, prot: 18.2, carb: 30.2, fat: 43.8, fib: 3.3 },
  { name: 'Pistachios', category: 'Frutos Secos', cal: 560, prot: 20.3, carb: 27.5, fat: 45.3, fib: 10.3 },
  { name: 'Pinhões', category: 'Frutos Secos', cal: 673, prot: 13.7, carb: 13.1, fat: 68.4, fib: 3.7 },
  { name: 'Sementes de chia', category: 'Sementes', cal: 486, prot: 16.5, carb: 42.1, fat: 30.7, fib: 34.4 },
  { name: 'Sementes de linhaça', category: 'Sementes', cal: 534, prot: 18.3, carb: 28.9, fat: 42.2, fib: 27.3 },
  { name: 'Sementes de abóbora', category: 'Sementes', cal: 559, prot: 30.2, carb: 10.5, fat: 49.1, fib: 6.0 },
  { name: 'Sementes de girassol', category: 'Sementes', cal: 584, prot: 20.8, carb: 20.0, fat: 51.5, fib: 8.6 },

  // Leguminosas
  { name: 'Grão-de-bico cozido', category: 'Leguminosas', cal: 164, prot: 8.9, carb: 27.4, fat: 2.6, fib: 7.6 },
  { name: 'Feijão preto cozido', category: 'Leguminosas', cal: 132, prot: 8.9, carb: 23.6, fat: 0.5, fib: 6.9 },
  { name: 'Feijão branco cozido', category: 'Leguminosas', cal: 140, prot: 9.6, carb: 25.1, fat: 0.6, fib: 6.8 },
  { name: 'Lentilha cozida', category: 'Leguminosas', cal: 116, prot: 9.0, carb: 20.1, fat: 0.4, fib: 7.9 },
  { name: 'Ervilha seca cozida', category: 'Leguminosas', cal: 118, prot: 8.3, carb: 20.8, fat: 0.5, fib: 8.3 },
  { name: 'Fava cozida', category: 'Leguminosas', cal: 110, prot: 7.9, carb: 19.5, fat: 0.6, fib: 5.5 },

  // Doces e Açúcares
  { name: 'Mel', category: 'Doces', cal: 304, prot: 0.3, carb: 82.4, fat: 0.0, fib: 0.2 },
  { name: 'Açúcar branco', category: 'Doces', cal: 387, prot: 0.0, carb: 99.9, fat: 0.0, fib: 0.0 },
  { name: 'Açúcar mascavado', category: 'Doces', cal: 380, prot: 0.0, carb: 97.0, fat: 0.0, fib: 0.0 },
  { name: 'Chocolate negro (70%)', category: 'Doces', cal: 598, prot: 7.8, carb: 45.9, fat: 43.0, fib: 11.0 },
  { name: 'Chocolate de leite', category: 'Doces', cal: 535, prot: 7.6, carb: 59.4, fat: 29.7, fib: 3.5 },
  { name: 'Compota de fruta', category: 'Doces', cal: 170, prot: 0.4, carb: 43.0, fat: 0.1, fib: 1.5 },
  { name: 'Doce de ovos', category: 'Doces', cal: 320, prot: 5.0, carb: 50.0, fat: 12.0, fib: 0.0 },
  { name: 'Pastel de nata', category: 'Doces', cal: 320, prot: 6.0, carb: 30.0, fat: 20.0, fib: 0.5 },
  { name: 'Bolo de arroz', category: 'Doces', cal: 350, prot: 5.0, carb: 45.0, fat: 16.0, fib: 1.0 },

  // Bebidas
  { name: 'Vinho tinto', category: 'Bebidas', cal: 85, prot: 0.1, carb: 2.6, fat: 0.0, fib: 0.0 },
  { name: 'Vinho branco', category: 'Bebidas', cal: 82, prot: 0.1, carb: 2.6, fat: 0.0, fib: 0.0 },
  { name: 'Cerveja (cerveja de consumo)', category: 'Bebidas', cal: 43, prot: 0.5, carb: 3.6, fat: 0.0, fib: 0.0 },
  { name: 'Sumo de laranja natural', category: 'Bebidas', cal: 45, prot: 0.7, carb: 10.4, fat: 0.2, fib: 0.2 },
  { name: 'Sumo de maçã natural', category: 'Bebidas', cal: 46, prot: 0.1, carb: 11.3, fat: 0.1, fib: 0.2 },
  { name: 'Chá (sem açúcar)', category: 'Bebidas', cal: 2, prot: 0.0, carb: 0.7, fat: 0.0, fib: 0.0 },
  { name: 'Café (sem açúcar)', category: 'Bebidas', cal: 2, prot: 0.1, carb: 0.0, fat: 0.0, fib: 0.0 },
  { name: 'Água', category: 'Bebidas', cal: 0, prot: 0.0, carb: 0.0, fat: 0.0, fib: 0.0 },

  // Outros
  { name: 'Molho de tomate', category: 'Outros', cal: 32, prot: 1.1, carb: 5.4, fat: 0.2, fib: 1.2 },
  { name: 'Ketchup', category: 'Outros', cal: 112, prot: 1.3, carb: 28.0, fat: 0.1, fib: 0.3 },
  { name: 'Mostarda', category: 'Outros', cal: 66, prot: 4.5, carb: 5.0, fat: 3.5, fib: 2.0 },
  { name: 'Maionese', category: 'Outros', cal: 680, prot: 1.0, carb: 1.0, fat: 75.0, fib: 0.0 },
  { name: 'Pesto', category: 'Outros', cal: 450, prot: 8.0, carb: 6.0, fat: 45.0, fib: 2.0 },
  { name: 'Croissant', category: 'Padaria', cal: 406, prot: 8.0, carb: 45.0, fat: 21.0, fib: 2.5 },
  { name: 'Bolo de côco', category: 'Padaria', cal: 370, prot: 5.0, carb: 45.0, fat: 18.0, fib: 2.0 },
  { name: 'Bolo-rei', category: 'Padaria', cal: 380, prot: 6.0, carb: 50.0, fat: 16.0, fib: 1.5 },
];

async function main() {
  console.log('🇵🇹 Importando base de alimentos portugueses INSA...');

  // Limpar alimentos globais existentes (opcional)
  // await prisma.food.deleteMany({
  //   where: { source: 'GLOBAL' },
  // });

  let imported = 0;
  let skipped = 0;

  for (const food of portugueseFoods) {
    // Verificar se o alimento já existe
    const existing = await prisma.food.findFirst({
      where: {
        name: food.name,
        source: 'GLOBAL',
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.food.create({
      data: {
        name: food.name,
        category: food.category,
        caloriesPer100g: food.cal,
        proteinPer100g: food.prot,
        carbsPer100g: food.carb,
        fatPer100g: food.fat,
        fiberPer100g: food.fib,
        source: 'GLOBAL',
        isActive: true,
      },
    });

    imported++;
  }

  console.log(`✅ Importação concluída!`);
  console.log(`   - Importados: ${imported} alimentos`);
  console.log(`   - Ignorados (já existiam): ${skipped} alimentos`);
  console.log(`   - Total na base: ${imported + skipped} alimentos`);
}

main()
  .catch((e) => {
    console.error('Erro na importação:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
