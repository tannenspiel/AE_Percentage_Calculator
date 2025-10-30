# Percentage Calculator v 1.6 for After Effects

---

## 🇬🇧 English Version

### Overview

**Percentage Calculator** is a specialized script for Adobe After Effects designed to **measure and control the exact percentage of screen area** occupied by layers in your composition. 

**Primary Purpose:** Comply with strict broadcast television requirements for on-air advertising overlays, where regulatory standards mandate precise screen area percentages for promotional graphics.

The script was born from the real-world challenge of **broadcast compliance** — TV stations require advertising overlays to occupy a specific percentage of screen space (typically 7-12% depending on regulations). Manual measurement is time-consuming and error-prone. This script automates the entire process.

### The Problem It Solves

**Broadcast Standard Challenge:**
- TV regulations specify exact screen area limits for advertising overlays
- Text layers with stroke/outline must be measured **including the stroke width**
- After Effects has no built-in tool to measure actual screen percentage
- Manual calculation is tedious and inaccurate

**Technical Challenge:**
- After Effects API doesn't provide programmatic access to create layer strokes
- `app.executeCommand(9008)` (Add Stroke) is unreliable and works inconsistently
- External FFX preset files create dependency issues and complicate distribution

**Solution:**
This script provides:
1. **Automatic stroke application** to text layers (embedded, no external files)
2. **Real-time percentage calculation** of screen area
3. **Linked layer system** where scaling automatically updates measurements
4. **Built-in FFX parser** to eliminate external file dependencies

### What It Does

The script generates **interconnected layer structures** where:
- A **SIZE shape layer** acts as the main controller
- Text automatically includes stroke outline (calculated in measurements)
- **Percentage display** shows real-time screen area coverage
- All elements stay linked — change scale, everything updates

**Key Feature:** The embedded stroke preset (converted to Base64) ensures the script is **100% self-contained** — no external dependencies, just one `.jsx` file.

---

### Installation

1. Copy `PercentageCalc.jsx` to:
   ```
   C:\Program Files\Adobe\Adobe After Effects [VERSION]\Support Files\Scripts\ScriptUI Panels\
   ```

2. Restart After Effects

3. Open via: **Window → ScriptUI Panels → PercentageCalc**

Or run directly from **File → Scripts** menu (no restart needed)

---

### Features

#### Tab 1: Percentage Calculator

##### Mode 1: CREATE 3 LAYERS (Full Control)
**Creates:** TXT layer + SIZE shape + Percentage display

**Use when:**
- Building advertising overlays from scratch
- Need text with automatic stroke for measurement
- Must comply with broadcast percentage requirements
- Want complete control over layout

**How to use:**
1. Enter a name (e.g., "Promo_7percent")
2. Click "Create 3 layers"
3. Three linked layers appear
4. Edit text in TXT layer (stroke is automatic)
5. Scale SIZE layer until percentage matches requirements
6. Percentage updates in real-time

**Broadcast workflow:** 
- Requirement: 7% screen coverage
- Scale SIZE until Percentage layer shows "7.00%"
- Done — guaranteed compliance

---

##### Mode 2: CREATE 2 LAYERS (Measurement Only)
**Creates:** SIZE shape + Percentage display

**Use when:**
- Measuring existing graphics or imported elements
- Creating reference guides for safe areas
- Don't need text, just area measurement
- Checking compliance of pre-made assets

**How to use:**
1. Enter a name (e.g., "Measure_Graphic")
2. Click "Create 2 Simple layers"
3. Position SIZE over your element
4. Scale to match boundaries
5. Read percentage instantly

---

##### Mode 3: CREATE 2 LAYERS (Based on Text)
**Creates:** Links to existing TXT + SIZE shape + Percentage display

**Use when:**
- Working with pre-positioned text
- Need to add stroke and measurement to existing text
- Want to preserve original text placement
- Retrofitting old projects for compliance

**How to use:**
1. Select your text layer
2. Enter a name (e.g., "Existing_Promo")
3. Click "Create layers based on Text"
4. SIZE appears **at text's exact position**
5. Stroke is applied automatically
6. Scale SIZE to control percentage

**Important:** Select exactly ONE text layer before clicking

---

#### Tab 2: Parsing FFX (Developer Tool)

**Purpose:** This advanced feature exists because After Effects' `app.executeCommand(9008)` for adding strokes is **unreliable**. To guarantee consistent stroke application, the script uses an **embedded FFX preset** (encoded as Base64).

**Why FFX Parsing?**

The original problem: measuring text layers with stroke requires the stroke to be part of the calculation. But:
- AE's API doesn't support programmatic stroke creation
- The `executeCommand` method works inconsistently
- External FFX files create dependencies (user must have the file)

**Solution:** 
1. Create a stroke preset once
2. Parse it to Base64 with this tool
3. Embed Base64 string in script code
4. Script is now **self-contained** — no external files needed

**How to use (for developers):**
1. Click "Select and Convert FFX"
2. Choose your stroke preset FFX file
3. Select where to save output
4. Two files created:
   - `StrokeFFX_Base64.txt` — encoded preset string
   - `FFXParser_Log.txt` — conversion details
5. Copy Base64 string into script code

**Result:** One `.jsx` file with everything embedded — no external dependencies, easy distribution.

---

### Understanding the Layers

#### SIZE Layer (Shape)
- **Role:** Master controller for the entire system
- **Control:** Scale property (Position/Anchor Point auto-calculated)
- **Effect:** Resizes text while maintaining proportions
- **Critical for broadcast:** This is what you scale to hit exact percentage requirements

#### TXT Layer (Text) — Modes 1 & 3 Only
- **Role:** Display text with automatic stroke outline
- **Stroke:** Applied automatically, no manual setup
- **Measurement:** Includes stroke width in calculations (broadcast-accurate)
- **Editable:** Change text, font, color — dimensions auto-adjust

#### Percentage Layer (Text)
- **Role:** Real-time screen area measurement
- **Display format:** "Promo_7percent: 7.23%"
- **Updates:** Instantly as you scale SIZE
- **Precision:** 2 decimal places for regulatory compliance

---

### Broadcast Compliance Workflow

**Typical TV Advertising Requirements:**
- Maximum allowed screen coverage: 7-12% (varies by country/network)
- Measurement must include stroke/outline
- Must maintain compliance across different broadcast formats

**Workflow Example:**
1. Create overlay with Mode 1
2. Design text and style
3. Scale SIZE layer until percentage = 7.00% (or required value)
4. Export for broadcast — guaranteed compliant
5. Documentation: Screenshot Percentage layer as proof of compliance

---

### Expressions Explained

#### Rectangle Size Expression
```javascript
// Calculates rectangle based on text size + stroke width
textWidth + (textStroke × 2) × textScale
```
**Why × 2?** Stroke appears on both sides of text outline

#### Percentage Expression
```javascript
Area = (Width × Height × Scale²) / (Comp Width × Comp Height) × 100%
```
Real-time calculation, updates every frame

---

### Error Messages & Solutions

| Error | Solution |
|-------|----------|
| "Please select a composition first!" | Click in Timeline to activate comp |
| "Please enter a layer name!" | Type name in text field |
| "Name contains invalid characters" | Remove `[ ] ( )` from name |
| "Layer already exists!" | Use different name |
| "Please select EXACTLY ONE text layer!" | Select one text layer for Mode 3 |
| "Selected layer is not a Text layer!" | Ensure text layer selected, not shape/image |

---

### Workflow Examples

#### Example 1: Broadcast Promo Overlay
```
Requirement: 7% screen coverage for lower-third promo
1. Mode 1 → "LowerThird_Promo"
2. Edit text: "SALE 50% OFF"
3. Style text (font, color)
4. Scale SIZE until percentage = 7.00%
5. Verify with QC — percentage visible on screen
6. Render and deliver
```

#### Example 2: Measuring Existing Graphic
```
Have imported logo, need to verify compliance
1. Mode 2 → "Logo_Check"
2. Position SIZE shape over logo
3. Scale to match logo boundaries
4. Read percentage — if >7%, scale down
5. Document result
```

#### Example 3: Retrofitting Old Project
```
Old text layer needs compliance check
1. Select existing text
2. Mode 3 → "OldText_Compliance"
3. Stroke applied automatically
4. Check percentage
5. Adjust scale if needed
```

---

### Technical Details

**Version:** 1.6  
**Compatibility:** After Effects CC 2019+  
**Language:** ExtendScript (JavaScript for AE)  
**Self-contained:** No external dependencies  

**Automated Features:**
- Layer naming and organization
- Expression linking
- Stroke application (embedded preset)
- Real-time calculations
- Percentage updates

**Broadcast-Grade Accuracy:**
- 2 decimal precision (0.01% granularity)
- Includes stroke width in measurements
- Frame-by-frame updates
- Scale-independent calculations

---

### Performance

- Minimal CPU impact (simple expressions only)
- Works with hundreds of layers
- Real-time updates, no lag
- No plugins required

---

### Tips & Tricks

1. **Create Templates:** Save comps with percentage setups as templates
2. **Multiple Overlays:** Use different modes for different elements
3. **Animation:** Animate SIZE scale for dynamic compliance (percentage changes over time)
4. **Documentation:** Screenshot percentage layer for compliance proof
5. **Reusable:** Duplicate layer groups for consistent branding across projects

---

### Support & Contact

**For bug reports or feature requests:**
- Contact: tannenspiel@gmail.com
- Alternative: eddiedie@yandex.ru

**FAQ:**

**Q: Why do I need stroke measurement?**  
A: Broadcast regulations measure **visual area**, which includes stroke outline. Without stroke, measurements are inaccurate.

**Q: Can I edit stroke after creation?**  
A: Yes, select text layer → Effect Controls → Layer Style → Stroke

**Q: Does it work with different resolutions?**  
A: Yes, percentage is resolution-independent (works for HD, 4K, any format)

**Q: Can I use this for non-broadcast work?**  
A: Absolutely — any time you need precise area measurements

---

### Version History

**v1.6** — Error handling, name validation, undo groups, FFX parser improvements  
**v1.5** — Tab interface, embedded FFX, help dialogs  
**v1.4** — Multiple layer modes  
**v1.0** — Initial release

---

### License

Free to use, modify, and distribute for personal and commercial projects.

Created for broadcast professionals, motion designers, and compliance engineers working with strict regulatory requirements.

**Happy broadcasting!**

---
---
---

## 🇷🇺 Русская версия

### Обзор

**Percentage Calculator** — это специализированный скрипт для Adobe After Effects, предназначенный для **измерения и контроля точного процента площади экрана**, занимаемого слоями в композиции.

**Основное назначение:** Соответствие строгим требованиям телевещания для рекламных плашек в эфире, где регуляторные стандарты устанавливают точные проценты площади экрана для промо-графики.

Скрипт родился из реальной задачи **соответствия стандартам вещания** — телеканалы требуют, чтобы рекламные плашки занимали конкретный процент экранной площади (обычно 7-12% в зависимости от регламента). Ручное измерение отнимает время и чревато ошибками. Этот скрипт автоматизирует весь процесс.

### Проблема, которую он решает

**Вызов телевизионных стандартов:**
- Регламенты ТВ определяют точные лимиты площади экрана для рекламных плашек
- Текстовые слои с обводкой должны измеряться **включая ширину обводки**
- В After Effects нет встроенного инструмента для измерения процента экрана
- Ручной расчёт утомителен и неточен

**Техническая проблема:**
- API After Effects не предоставляет программного доступа к созданию обводки слоёв
- `app.executeCommand(9008)` (Add Stroke) работает ненадёжно и непоследовательно
- Внешние FFX-файлы создают зависимости и усложняют распространение

**Решение:**
Этот скрипт обеспечивает:
1. **Автоматическое применение обводки** к текстовым слоям (встроено, без внешних файлов)
2. **Расчёт процента площади** в реальном времени
3. **Связанную систему слоёв**, где масштабирование автоматически обновляет измерения
4. **Встроенный парсер FFX** для устранения зависимостей от внешних файлов

### Что он делает

Скрипт генерирует **взаимосвязанные структуры слоёв**, где:
- **SIZE-слой (фигура)** служит главным контроллером
- Текст автоматически включает обводку (учитывается в измерениях)
- **Percentage-слой** показывает покрытие площади экрана в реальном времени
- Все элементы связаны — меняешь масштаб, всё обновляется

**Ключевая функция:** Встроенный пресет обводки (конвертированный в Base64) гарантирует, что скрипт **полностью автономен** — никаких внешних зависимостей, только один `.jsx` файл.

---

### Установка

1. Скопируй `PercentageCalc.jsx` в папку:
   ```
   C:\Program Files\Adobe\Adobe After Effects [VERSION]\Support Files\Scripts\ScriptUI Panels\
   ```

2. Перезагрузи After Effects

3. Открой через: **Window → ScriptUI Panels → PercentageCalc**

Или запусти напрямую из меню **File → Scripts** (перезагрузка не требуется)

---

### Функции

#### Вкладка 1: Percentage Calculator

##### Режим 1: CREATE 3 LAYERS (Полный контроль)
**Создаёт:** TXT-слой + SIZE-фигура + Percentage

**Используй когда:**
- Строишь рекламные плашки с нуля
- Нужен текст с автоматической обводкой для измерения
- Требуется соответствие телевизионным процентным требованиям
- Нужен полный контроль над раскладкой

**Как использовать:**
1. Введи имя (например, "Promo_7percent")
2. Клик "Create 3 layers"
3. Появляются три связанных слоя
4. Редактируй текст в TXT-слое (обводка автоматическая)
5. Масштабируй SIZE-слой до соответствия требованиям
6. Процент обновляется в реальном времени

**Вещательный процесс:**
- Требование: 7% покрытия экрана
- Масштабируй SIZE, пока Percentage не покажет "7.00%"
- Готово — гарантированное соответствие

---

##### Режим 2: CREATE 2 LAYERS (Только измерение)
**Создаёт:** SIZE-фигура + Percentage

**Используй когда:**
- Измеряешь существующую графику или импортированные элементы
- Создаёшь направляющие для безопасных зон
- Не нужен текст, только измерение площади
- Проверяешь соответствие готовых ассетов

**Как использовать:**
1. Введи имя (например, "Measure_Graphic")
2. Клик "Create 2 Simple layers"
3. Позиционируй SIZE над твоим элементом
4. Масштабируй под границы
5. Моментально считай процент

---

##### Режим 3: CREATE 2 LAYERS (На основе текста)
**Создаёт:** Связь с существующим TXT + SIZE-фигура + Percentage

**Используй когда:**
- Работаешь с предварительно размещённым текстом
- Нужно добавить обводку и измерение к существующему тексту
- Хочешь сохранить оригинальное размещение текста
- Адаптируешь старые проекты под требования

**Как использовать:**
1. Выбери текстовый слой
2. Введи имя (например, "Existing_Promo")
3. Клик "Create layers based on Text"
4. SIZE появляется **точно на месте текста**
5. Обводка применяется автоматически
6. Масштабируй SIZE для контроля процента

**Важно:** Выбери ровно ОДИН текстовый слой перед кликом

---

#### Вкладка 2: Parsing FFX (Инструмент разработчика)

**Назначение:** Эта продвинутая функция существует, потому что `app.executeCommand(9008)` After Effects для добавления обводок **ненадёжен**. Чтобы гарантировать последовательное применение обводки, скрипт использует **встроенный FFX-пресет** (закодированный в Base64).

**Зачем нужен парсинг FFX?**

Оригинальная проблема: измерение текстовых слоёв с обводкой требует, чтобы обводка была частью расчёта. Но:
- API AE не поддерживает программное создание обводки
- Метод `executeCommand` работает непоследовательно
- Внешние FFX-файлы создают зависимости (пользователь должен иметь файл)

**Решение:**
1. Создай пресет обводки один раз
2. Преобразуй его в Base64 этим инструментом
3. Встрой Base64-строку в код скрипта
4. Скрипт теперь **автономен** — никаких внешних файлов

**Как использовать (для разработчиков):**
1. Клик "Select and Convert FFX"
2. Выбери FFX-файл пресета обводки
3. Выбери, где сохранить результат
4. Создаются два файла:
   - `StrokeFFX_Base64.txt` — закодированная строка пресета
   - `FFXParser_Log.txt` — детали конвертации
5. Скопируй Base64-строку в код скрипта

**Результат:** Один `.jsx` файл со всем встроенным — никаких внешних зависимостей, лёгкое распространение.

---

### Понимание слоёв

#### SIZE-слой (Фигура)
- **Роль:** Главный контроллер всей системы
- **Управление:** Свойство Scale (Position/Anchor Point рассчитываются автоматически)
- **Эффект:** Изменяет размер текста с сохранением пропорций
- **Критично для эфира:** Это то, что масштабируешь для точного соответствия процентам

#### TXT-слой (Текст) — Режимы 1 и 3
- **Роль:** Отображение текста с автоматической обводкой
- **Обводка:** Применяется автоматически, без ручной настройки
- **Измерение:** Включает ширину обводки в расчёты (точность эфира)
- **Редактируемо:** Меняй текст, шрифт, цвет — размеры адаптируются

#### Percentage-слой (Текст)
- **Роль:** Измерение площади экрана в реальном времени
- **Формат отображения:** "Promo_7percent: 7.23%"
- **Обновления:** Мгновенно при масштабировании SIZE
- **Точность:** 2 знака после запятой для соответствия регламентам

---

### Процесс соответствия эфирным требованиям

**Типичные требования ТВ-рекламы:**
- Максимально допустимое покрытие экрана: 7-12% (зависит от страны/канала)
- Измерение должно включать обводку/контур
- Соответствие должно сохраняться в разных форматах вещания

**Пример процесса:**
1. Создай плашку в Режиме 1
2. Дизайн текста и стиля
3. Масштабируй SIZE-слой до процента = 7.00% (или требуемого значения)
4. Экспорт для эфира — гарантированное соответствие
5. Документация: Скриншот Percentage-слоя как доказательство соответствия

---

### Объяснение выражений

#### Выражение размера прямоугольника
```javascript
// Рассчитывает прямоугольник на основе размера текста + ширина обводки
textWidth + (textStroke × 2) × textScale
```
**Почему × 2?** Обводка появляется с обеих сторон контура текста

#### Выражение процента
```javascript
Площадь = (Ширина × Высота × Масштаб²) / (Ширина компа × Высота компа) × 100%
```
Расчёт в реальном времени, обновляется каждый кадр

---

### Ошибки и решения

| Ошибка | Решение |
|--------|---------|
| "Please select a composition first!" | Кликни в Timeline для активации композиции |
| "Please enter a layer name!" | Введи имя в текстовое поле |
| "Name contains invalid characters" | Удали `[ ] ( )` из имени |
| "Layer already exists!" | Используй другое имя |
| "Please select EXACTLY ONE text layer!" | Выбери один текстовый слой для Режима 3 |
| "Selected layer is not a Text layer!" | Убедись, что выбран текст, а не фигура/изображение |

---

### Примеры использования

#### Пример 1: Эфирная промо-плашка
```
Требование: 7% покрытия экрана для нижней трети
1. Режим 1 → "LowerThird_Promo"
2. Редактируй текст: "СКИДКА 50%"
3. Стилизуй текст (шрифт, цвет)
4. Масштабируй SIZE до процента = 7.00%
5. Проверка с QC — процент виден на экране
6. Рендер и доставка
```

#### Пример 2: Измерение существующей графики
```
Импортирован логотип, нужна проверка соответствия
1. Режим 2 → "Logo_Check"
2. Позиционируй SIZE-фигуру над логотипом
3. Масштабируй под границы лого
4. Считай процент — если >7%, уменьшай
5. Документируй результат
```

#### Пример 3: Адаптация старого проекта
```
Старый текстовый слой требует проверки соответствия
1. Выбери существующий текст
2. Режим 3 → "OldText_Compliance"
3. Обводка применяется автоматически
4. Проверь процент
5. При необходимости откорректируй масштаб
```

---

### Технические детали

**Версия:** 1.6  
**Совместимость:** After Effects CC 2019+  
**Язык:** ExtendScript (JavaScript для AE)  
**Автономность:** Без внешних зависимостей  

**Автоматизированные функции:**
- Именование и организация слоёв
- Связывание выражений
- Применение обводки (встроенный пресет)
- Расчёты в реальном времени
- Обновление процентов

**Точность эфирного уровня:**
- Точность 2 знака (0.01% гранулярность)
- Включает ширину обводки в измерения
- Обновления покадрово
- Расчёты независимы от масштаба

---

### Производительность

- Минимальная нагрузка на CPU (только простые выражения)
- Работает с сотнями слоёв
- Обновления в реальном времени, без лагов
- Плагины не требуются

---

### Советы и трюки

1. **Создавай шаблоны:** Сохраняй композиции с настройками процентов как шаблоны
2. **Множественные плашки:** Используй разные режимы для разных элементов
3. **Анимация:** Анимируй масштаб SIZE для динамического соответствия (процент меняется со временем)
4. **Документация:** Скриншот percentage-слоя как доказательство соответствия
5. **Повторное использование:** Дублируй группы слоёв для консистентного брендинга в проектах

---

### Поддержка и контакты

**Для отчётов об ошибках или предложений:**
- Контакт: tannenspiel@gmail.com
- Альтернатива: eddiedie@yandex.ru

**FAQ:**

**В: Зачем нужно измерять обводку?**  
О: Эфирные регламенты измеряют **визуальную площадь**, которая включает обводку. Без обводки измерения неточны.

**В: Можно ли редактировать обводку после создания?**  
О: Да, выбери текстовый слой → Effect Controls → Layer Style → Stroke

**В: Работает ли с разными разрешениями?**  
О: Да, процент не зависит от разрешения (работает для HD, 4K, любого формата)

**В: Можно использовать не для эфира?**  
О: Конечно — всегда, когда нужны точные измерения площади

---

### История версий

**v1.6** — Обработка ошибок, валидация имён, undo-группы, улучшения парсера FFX  
**v1.5** — Интерфейс с вкладками, встроенный FFX, диалоги помощи  
**v1.4** — Несколько режимов слоёв  
**v1.0** — Первый релиз

---

### Лицензия

Свободно используй, модифицируй и распространяй для личных и коммерческих проектов.

Создано для профессионалов вещания, motion-дизайнеров и инженеров соответствия, работающих со строгими регуляторными требованиями.

**Удачи в эфире!**
