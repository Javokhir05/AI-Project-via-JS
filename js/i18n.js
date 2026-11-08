/*
 * Tiny i18n layer: English, Uzbek, Polish, Russian.
 * Load it at the END of <body>, before the other page scripts.
 *
 * HTML:  data-i18n="key"                      -> textContent
 *        data-i18n-html="key"                 -> innerHTML (trusted strings only)
 *        data-i18n-placeholder|aria|title|alt|content="key"  -> that attribute
 *        <div data-lang-switch></div>         -> the language dropdown is built here
 * JS:    I18n.t("key", { name: "x" }), I18n.onChange(fn), I18n.setLang("pl")
 *
 * To add a language: add it to LANGS, then add one more entry to every row in T
 * (same order as LANGS) and to TYPED.
 */
const I18n = (() => {
    const KEY = "chatbot_lang";
    const LANGS = [["en", "English"], ["uz", "O‘zbekcha"], ["pl", "Polski"], ["ru", "Русский"]];
    const CODES = LANGS.map((l) => l[0]);

    // key: [English, Uzbek, Polish, Russian]
    const T = {
        // ----- common -----
        "common.language": ["Language", "Til", "Język", "Язык"],
        "common.toggleTheme": ["Toggle dark mode", "Tungi rejimni almashtirish", "Przełącz tryb ciemny", "Переключить тёмную тему"],
        "common.login": ["Log in", "Kirish", "Zaloguj się", "Войти"],
        "common.signup": ["Sign up", "Ro‘yxatdan o‘tish", "Zarejestruj się", "Регистрация"],
        "common.openChat": ["Open chat", "Chatni ochish", "Otwórz czat", "Открыть чат"],
        "common.home": ["Home", "Bosh sahifa", "Strona główna", "Главная"],
        "common.createAccount": ["Create account", "Hisob yaratish", "Utwórz konto", "Создать аккаунт"],

        // ----- landing -----
        "nav.features": ["Features", "Imkoniyatlar", "Funkcje", "Возможности"],
        "nav.how": ["How it works", "Qanday ishlaydi", "Jak to działa", "Как это работает"],
        "nav.faq": ["FAQ", "Savollar", "FAQ", "Вопросы и ответы"],
        "nav.menu": ["Open menu", "Menyuni ochish", "Otwórz menu", "Открыть меню"],
        "landing.title": ["ChatBot – Ask anything, get answers fast", "ChatBot – Xohlagan narsani so‘rang, tez javob oling", "ChatBot – Pytaj o wszystko, szybko dostaj odpowiedzi", "ChatBot – Спрашивайте что угодно, получайте быстрые ответы"],
        "landing.desc": ["A friendly AI chat assistant. Ask questions, share images, and pick up your conversations right where you left off.", "Do‘stona AI chat yordamchi. Savol bering, rasm yuboring va suhbatlaringizni to‘xtagan joyingizdan davom ettiring.", "Przyjazny asystent AI. Zadawaj pytania, wysyłaj obrazy i wracaj do rozmów dokładnie tam, gdzie skończyłeś.", "Дружелюбный ИИ-помощник. Задавайте вопросы, отправляйте изображения и продолжайте разговоры с того места, где остановились."],
        "hero.pill": ["AI assistant", "AI yordamchi", "Asystent AI", "ИИ-помощник"],
        "hero.line1": ["Ask anything.", "Xohlagan narsani so‘rang.", "Pytaj o wszystko.", "Спрашивайте что угодно."],
        "hero.line2": ["Get answers fast.", "Tez javob oling.", "Szybko dostaniesz odpowiedź.", "Получайте быстрые ответы."],
        "hero.lead": ["A friendly chatbot that helps you write, learn and solve problems. Share an image, keep every conversation, and pick up exactly where you left off.", "Yozish, o‘rganish va muammolarni hal qilishda yordam beradigan do‘stona chatbot. Rasm yuboring, har bir suhbatni saqlang va aynan to‘xtagan joyingizdan davom eting.", "Przyjazny chatbot, który pomaga pisać, uczyć się i rozwiązywać problemy. Wysyłaj obrazy, zachowaj każdą rozmowę i wracaj dokładnie tam, gdzie skończyłeś.", "Дружелюбный чат-бот, который помогает писать, учиться и решать задачи. Отправляйте изображения, сохраняйте каждый разговор и продолжайте ровно с того места, где остановились."],
        "hero.cta": ["Get started free", "Bepul boshlash", "Zacznij za darmo", "Начать бесплатно"],
        "hero.how": ["See how it works", "Qanday ishlashini ko‘ring", "Zobacz, jak to działa", "Узнать, как это работает"],
        "hero.p1": ["Free to try", "Bepul sinab ko‘ring", "Wypróbuj za darmo", "Бесплатно попробовать"],
        "hero.p2": ["Chat history saved", "Suhbatlar tarixi saqlanadi", "Historia czatów zapisana", "История чатов сохраняется"],
        "hero.p3": ["Works on any device", "Istalgan qurilmada ishlaydi", "Działa na każdym urządzeniu", "Работает на любом устройстве"],
        "mock.bot1": ["Hey there 🖐 How can I help you today?", "Salom 🖐 Bugun sizga qanday yordam bera olaman?", "Cześć 🖐 W czym mogę dziś pomóc?", "Привет 🖐 Чем могу помочь сегодня?"],
        "mock.user": ["Can you explain how photosynthesis works?", "Fotosintez qanday ishlashini tushuntira olasizmi?", "Możesz wyjaśnić, jak działa fotosynteza?", "Можешь объяснить, как работает фотосинтез?"],
        "mock.bot2": ["Sure! Plants turn sunlight, water and CO₂ into sugar and oxygen inside their chloroplasts…", "Albatta! O‘simliklar xloroplastlarida quyosh nuri, suv va CO₂ni shakar va kislorodga aylantiradi…", "Jasne! Rośliny w chloroplastach zamieniają światło słoneczne, wodę i CO₂ w cukier i tlen…", "Конечно! Растения в хлоропластах превращают солнечный свет, воду и CO₂ в сахар и кислород…"],
        "mock.online": ["online", "onlayn", "online", "онлайн"],
        "mock.input": ["Message…", "Xabar…", "Wiadomość…", "Сообщение…"],
        "mock.float1": ["History saved", "Tarix saqlanadi", "Historia zapisana", "История сохранена"],
        "mock.float2": ["Image support", "Rasm qo‘llab-quvvatlanadi", "Obsługa obrazów", "Поддержка изображений"],
        "feat.title": ["Everything you need in a chat", "Chatda kerak bo‘lgan hamma narsa", "Wszystko, czego potrzebujesz w czacie", "Всё, что нужно в чате"],
        "feat.sub": ["Simple on the surface, with the details that make a daily assistant pleasant to use.", "Tashqaridan oddiy, ammo kundalik yordamchini qulay qiladigan tafsilotlar bilan.", "Prosty na pierwszy rzut oka, z detalami, dzięki którym codzienne korzystanie to przyjemność.", "Просто снаружи, с деталями, которые делают ежедневного помощника приятным в использовании."],
        "feat.1.t": ["Natural conversations", "Tabiiy suhbat", "Naturalne rozmowy", "Естественное общение"],
        "feat.1.d": ["Ask follow-up questions and the bot remembers the context of the whole chat.", "Aniqlashtiruvchi savollar bering, bot butun suhbat kontekstini eslab qoladi.", "Zadawaj dodatkowe pytania, a bot pamięta kontekst całej rozmowy.", "Задавайте уточняющие вопросы — бот помнит контекст всего чата."],
        "feat.2.t": ["Saved history", "Saqlangan tarix", "Zapisana historia", "Сохранённая история"],
        "feat.2.d": ["Every chat is stored in your account. Search, reopen or delete them any time.", "Har bir chat hisobingizda saqlanadi. Istalgan vaqtda qidiring, qayta oching yoki o‘chiring.", "Każdy czat jest zapisany na Twoim koncie. Wyszukuj, otwieraj ponownie lub usuwaj w dowolnym momencie.", "Каждый чат сохраняется в вашем аккаунте. Ищите, открывайте заново или удаляйте в любое время."],
        "feat.3.t": ["Understands images", "Rasmlarni tushunadi", "Rozumie obrazy", "Понимает изображения"],
        "feat.3.d": ["Attach a picture and ask about it: read text, identify objects, get ideas.", "Rasm biriktiring va u haqida so‘rang: matnni o‘qing, narsalarni aniqlang, g‘oyalar oling.", "Dołącz zdjęcie i zapytaj o nie: odczytaj tekst, rozpoznaj obiekty, zdobądź pomysły.", "Прикрепите картинку и спросите о ней: прочитайте текст, определите предметы, получите идеи."],
        "feat.4.t": ["Works everywhere", "Hamma joyda ishlaydi", "Działa wszędzie", "Работает везде"],
        "feat.4.d": ["A layout that adapts from large monitors down to small phones.", "Katta monitorlardan kichik telefonlargacha moslashadigan dizayn.", "Układ dopasowuje się od dużych monitorów po małe telefony.", "Интерфейс адаптируется от больших мониторов до маленьких телефонов."],
        "feat.5.t": ["Light & dark themes", "Yorug‘ va qorong‘i mavzular", "Jasny i ciemny motyw", "Светлая и тёмная темы"],
        "feat.5.d": ["Easy on the eyes day or night. Your choice is remembered.", "Kechayu kunduz ko‘zga qulay. Tanlovingiz eslab qolinadi.", "Przyjazne dla oczu w dzień i w nocy. Twój wybór jest zapamiętywany.", "Комфортно для глаз днём и ночью. Ваш выбор запоминается."],
        "feat.6.t": ["Emoji & formatting", "Emoji va formatlash", "Emoji i formatowanie", "Эмодзи и форматирование"],
        "feat.6.d": ["Add emoji to your messages, and read answers with lists and code blocks.", "Xabarlaringizga emoji qo‘shing, javoblarni ro‘yxat va kod bloklari bilan o‘qing.", "Dodawaj emoji do wiadomości i czytaj odpowiedzi z listami i blokami kodu.", "Добавляйте эмодзи в сообщения и читайте ответы со списками и блоками кода."],
        "how.title": ["Up and running in three steps", "Uch qadamda ishga tushiring", "Gotowe w trzech krokach", "Начните за три шага"],
        "how.1.t": ["Create an account", "Hisob yarating", "Utwórz konto", "Создайте аккаунт"],
        "how.1.d": ["Sign up with your email in under a minute.", "Elektron pochta bilan bir daqiqadan kamroq vaqtda ro‘yxatdan o‘ting.", "Zarejestruj się e-mailem w mniej niż minutę.", "Зарегистрируйтесь по e-mail меньше чем за минуту."],
        "how.2.t": ["Start a chat", "Chatni boshlang", "Rozpocznij czat", "Начните чат"],
        "how.2.d": ["Type a question or pick one of the suggestions.", "Savol yozing yoki takliflardan birini tanlang.", "Wpisz pytanie lub wybierz jedną z propozycji.", "Введите вопрос или выберите один из вариантов."],
        "how.3.t": ["Come back later", "Keyinroq qaytib keling", "Wróć później", "Возвращайтесь позже"],
        "how.3.d": ["Your conversations wait in the sidebar whenever you return.", "Qaytganingizda suhbatlaringiz yon panelda kutib turadi.", "Twoje rozmowy czekają w panelu bocznym, kiedy tylko wrócisz.", "Ваши разговоры ждут в боковой панели, когда бы вы ни вернулись."],
        "faq.title": ["Questions, answered", "Savollarga javoblar", "Odpowiedzi na pytania", "Ответы на вопросы"],
        "faq.1.q": ["Is my chat history private?", "Chat tarixim maxfiymi?", "Czy moja historia czatów jest prywatna?", "Моя история чатов приватна?"],
        "faq.1.a": ["In this version your account and history are stored in your own browser, so they stay on your device. A server-backed version would sync them across devices.", "Bu versiyada hisob va tarix o‘zingizning brauzeringizda saqlanadi, shuning uchun qurilmangizda qoladi. Server asosidagi versiya ularni qurilmalar o‘rtasida sinxronlashtirardi.", "W tej wersji konto i historia są przechowywane w Twojej przeglądarce, więc zostają na Twoim urządzeniu. Wersja z serwerem synchronizowałaby je między urządzeniami.", "В этой версии аккаунт и история хранятся в вашем браузере и остаются на вашем устройстве. Версия с сервером синхронизировала бы их между устройствами."],
        "faq.2.q": ["Can I use it on my phone?", "Telefonimda ishlata olamanmi?", "Czy mogę używać tego na telefonie?", "Можно ли пользоваться на телефоне?"],
        "faq.2.a": ["Yes. Every page adapts to small screens, and the history sidebar becomes a slide-in menu.", "Ha. Har bir sahifa kichik ekranlarga moslashadi, tarix paneli esa surilib chiqadigan menyuga aylanadi.", "Tak. Każda strona dostosowuje się do małych ekranów, a panel historii zamienia się w wysuwane menu.", "Да. Каждая страница адаптируется к небольшим экранам, а боковая панель истории превращается в выдвижное меню."],
        "faq.3.q": ["Can I send images?", "Rasm yubora olamanmi?", "Czy mogę wysyłać obrazy?", "Можно ли отправлять изображения?"],
        "faq.3.a": ["Yes. Use the paperclip in the message box to attach an image and ask about it.", "Ha. Xabar maydonidagi skrepka orqali rasm biriktiring va u haqida so‘rang.", "Tak. Użyj spinacza w polu wiadomości, aby dołączyć obraz i zapytać o niego.", "Да. Нажмите на скрепку в поле сообщения, прикрепите изображение и задайте вопрос о нём."],
        "faq.4.q": ["How do I delete my conversations?", "Suhbatlarimni qanday o‘chiraman?", "Jak usunąć moje rozmowy?", "Как удалить мои разговоры?"],
        "faq.4.a": ["Hover a chat in the sidebar and press the bin icon, or clear everything at once from the sidebar footer.", "Yon paneldagi chat ustiga kursorni olib boring va savat belgisini bosing yoki hammasini yon panel pastidan birdan tozalang.", "Najedź na czat w panelu bocznym i kliknij ikonę kosza albo wyczyść wszystko naraz na dole panelu.", "Наведите курсор на чат в боковой панели и нажмите значок корзины или очистите всё сразу в нижней части панели."],
        "cta.title": ["Ready to start chatting?", "Suhbatni boshlashga tayyormisiz?", "Gotowy, by zacząć rozmowę?", "Готовы начать общение?"],
        "cta.sub": ["Create a free account and ask your first question.", "Bepul hisob yarating va birinchi savolingizni bering.", "Utwórz darmowe konto i zadaj pierwsze pytanie.", "Создайте бесплатный аккаунт и задайте первый вопрос."],
        "footer.rights": ["All rights reserved.", "Barcha huquqlar himoyalangan.", "Wszelkie prawa zastrzeżone.", "Все права защищены."],

        // ----- login / register -----
        "login.doc": ["Log in – ChatBot", "Kirish – ChatBot", "Logowanie – ChatBot", "Вход – ChatBot"],
        "login.asideTitle": ["Welcome back 👋", "Qaytganingiz bilan 👋", "Witaj z powrotem 👋", "С возвращением 👋"],
        "login.asideText": ["Pick up your conversations right where you left them.", "Suhbatlaringizni to‘xtagan joyingizdan davom ettiring.", "Wróć do rozmów dokładnie tam, gdzie skończyłeś.", "Продолжайте разговоры с того места, где остановились."],
        "login.a1": ["All your chats in one sidebar", "Barcha chatlaringiz bitta yon panelda", "Wszystkie czaty w jednym panelu", "Все чаты в одной боковой панели"],
        "login.a2": ["Search and reopen past conversations", "Oldingi suhbatlarni qidiring va qayta oching", "Wyszukuj i otwieraj dawne rozmowy", "Ищите и открывайте прошлые разговоры"],
        "login.a3": ["Light and dark themes", "Yorug‘ va qorong‘i mavzular", "Jasny i ciemny motyw", "Светлая и тёмная темы"],
        "login.title": ["Log in", "Kirish", "Logowanie", "Вход"],
        "login.sub": ["Enter your details to access your chats.", "Chatlaringizga kirish uchun ma’lumotlaringizni kiriting.", "Wpisz swoje dane, aby uzyskać dostęp do czatów.", "Введите данные, чтобы получить доступ к чатам."],
        "login.newHere": ["New here?", "Yangimisiz?", "Nowy tutaj?", "Впервые здесь?"],
        "login.createLink": ["Create an account", "Hisob yarating", "Utwórz konto", "Создайте аккаунт"],
        "register.doc": ["Create account – ChatBot", "Hisob yaratish – ChatBot", "Utwórz konto – ChatBot", "Создать аккаунт – ChatBot"],
        "register.asideTitle": ["Start chatting in a minute", "Bir daqiqada suhbatni boshlang", "Zacznij rozmawiać w minutę", "Начните общение за минуту"],
        "register.asideText": ["Create a free account to save your conversations and come back to them anytime.", "Suhbatlaringizni saqlash va istalgan vaqt qaytish uchun bepul hisob yarating.", "Utwórz darmowe konto, aby zapisywać rozmowy i wracać do nich w dowolnym momencie.", "Создайте бесплатный аккаунт, чтобы сохранять разговоры и возвращаться к ним в любое время."],
        "register.a1": ["Free to get started", "Boshlash bepul", "Darmowy start", "Бесплатное начало"],
        "register.a2": ["History saved to your account", "Tarix hisobingizga saqlanadi", "Historia zapisana na Twoim koncie", "История сохраняется в аккаунте"],
        "register.a3": ["Share images and ask about them", "Rasm yuboring va ular haqida so‘rang", "Wysyłaj obrazy i pytaj o nie", "Отправляйте изображения и спрашивайте о них"],
        "register.title": ["Create your account", "Hisobingizni yarating", "Utwórz konto", "Создайте аккаунт"],
        "register.sub": ["It only takes a moment.", "Bu bir necha soniya vaqt oladi.", "To zajmie tylko chwilę.", "Это займёт всего минуту."],
        "register.name": ["Name", "Ism", "Imię", "Имя"],
        "register.namePh": ["Your name", "Ismingiz", "Twoje imię", "Ваше имя"],
        "register.pwPh": ["At least 8 characters", "Kamida 8 ta belgi", "Co najmniej 8 znaków", "Не менее 8 символов"],
        "register.confirm": ["Confirm password", "Parolni tasdiqlang", "Potwierdź hasło", "Подтвердите пароль"],
        "register.confirmPh": ["Repeat your password", "Parolni takrorlang", "Powtórz hasło", "Повторите пароль"],
        "register.have": ["Already have an account?", "Hisobingiz bormi?", "Masz już konto?", "Уже есть аккаунт?"],
        "register.loginLink": ["Log in", "Kiring", "Zaloguj się", "Войдите"],
        "form.email": ["Email", "Elektron pochta", "E-mail", "E-mail"],
        "form.password": ["Password", "Parol", "Hasło", "Пароль"],
        "form.passwordPh": ["Your password", "Parolingiz", "Twoje hasło", "Ваш пароль"],
        "form.remember": ["Remember me", "Meni eslab qol", "Zapamiętaj mnie", "Запомнить меня"],
        "form.showPassword": ["Show password", "Parolni ko‘rsatish", "Pokaż hasło", "Показать пароль"],
        "form.hidePassword": ["Hide password", "Parolni yashirish", "Ukryj hasło", "Скрыть пароль"],
        "form.wait": ["Please wait…", "Iltimos, kuting…", "Proszę czekać…", "Подождите…"],
        "strength.weak": ["Weak", "Zaif", "Słabe", "Слабый"],
        "strength.fair": ["Fair", "O‘rtacha", "Średnie", "Средний"],
        "strength.good": ["Good", "Yaxshi", "Dobre", "Хороший"],
        "strength.strong": ["Strong", "Kuchli", "Silne", "Надёжный"],
        "err.mismatch": ["Passwords don't match.", "Parollar mos kelmadi.", "Hasła nie są takie same.", "Пароли не совпадают."],
        "err.enterEmail": ["Enter your email.", "Elektron pochtangizni kiriting.", "Wpisz swój e-mail.", "Введите e-mail."],
        "err.enterPassword": ["Enter your password.", "Parolingizni kiriting.", "Wpisz hasło.", "Введите пароль."],
        "err.name": ["Please enter your name.", "Ismingizni kiriting.", "Wpisz swoje imię.", "Пожалуйста, введите имя."],
        "err.emailInvalid": ["Enter a valid email address.", "To‘g‘ri elektron pochta manzilini kiriting.", "Wpisz poprawny adres e-mail.", "Введите корректный адрес e-mail."],
        "err.passwordShort": ["Use at least 8 characters.", "Kamida 8 ta belgi ishlating.", "Użyj co najmniej 8 znaków.", "Используйте не менее 8 символов."],
        "err.emailTaken": ["An account with this email already exists.", "Bu elektron pochta bilan hisob allaqachon mavjud.", "Konto z tym adresem e-mail już istnieje.", "Аккаунт с таким e-mail уже существует."],
        "err.badLogin": ["Incorrect email or password.", "Elektron pochta yoki parol noto‘g‘ri.", "Nieprawidłowy e-mail lub hasło.", "Неверный e-mail или пароль."],

        // ----- chat -----
        "chat.doc": ["Chat – ChatBot", "Chat – ChatBot", "Czat – ChatBot", "Чат – ChatBot"],
        "chat.sidebarLabel": ["Chat history", "Chat tarixi", "Historia czatów", "История чатов"],
        "chat.closeMenu": ["Close menu", "Menyuni yopish", "Zamknij menu", "Закрыть меню"],
        "chat.new": ["New chat", "Yangi chat", "Nowy czat", "Новый чат"],
        "chat.searchPh": ["Search chats", "Chatlarni qidirish", "Szukaj czatów", "Поиск чатов"],
        "chat.clearAll": ["Clear all history", "Barcha tarixni tozalash", "Wyczyść całą historię", "Очистить всю историю"],
        "chat.logout": ["Log out", "Chiqish", "Wyloguj się", "Выйти"],
        "chat.openHistory": ["Open chat history", "Chat tarixini ochish", "Otwórz historię czatów", "Открыть историю чатов"],
        "chat.inputPh": ["Message ChatBot…", "ChatBotga xabar yozing…", "Napisz do ChatBota…", "Сообщение для ChatBot…"],
        "chat.message": ["Message", "Xabar", "Wiadomość", "Сообщение"],
        "chat.emoji": ["Insert emoji", "Emoji qo‘shish", "Wstaw emoji", "Вставить эмодзи"],
        "chat.attach": ["Attach image", "Rasm biriktirish", "Dołącz obraz", "Прикрепить изображение"],
        "chat.send": ["Send message", "Xabarni yuborish", "Wyślij wiadomość", "Отправить сообщение"],
        "chat.attached": ["Attached image", "Biriktirilgan rasm", "Załączony obraz", "Прикреплённое изображение"],
        "chat.removeImage": ["Remove image", "Rasmni olib tashlash", "Usuń obraz", "Удалить изображение"],
        "chat.hint": ["Responses may contain mistakes. Press <kbd>Enter</kbd> to send, <kbd>Shift</kbd>+<kbd>Enter</kbd> for a new line.", "Javoblarda xatolar bo‘lishi mumkin. Yuborish uchun <kbd>Enter</kbd>, yangi qator uchun <kbd>Shift</kbd>+<kbd>Enter</kbd> bosing.", "Odpowiedzi mogą zawierać błędy. Naciśnij <kbd>Enter</kbd>, aby wysłać, <kbd>Shift</kbd>+<kbd>Enter</kbd> – nowa linia.", "Ответы могут содержать ошибки. Нажмите <kbd>Enter</kbd> для отправки, <kbd>Shift</kbd>+<kbd>Enter</kbd> — новая строка."],
        "chat.welcome": ["Hi {name}, how can I help?", "Salom, {name}, sizga qanday yordam bera olaman?", "Cześć {name}, w czym mogę pomóc?", "Привет, {name}! Чем могу помочь?"],
        "chat.welcomeSub": ["Ask me anything, or try one of these.", "Xohlagan narsani so‘rang yoki shulardan birini sinab ko‘ring.", "Zapytaj o cokolwiek albo spróbuj jednej z tych propozycji.", "Спросите что угодно или попробуйте один из вариантов."],
        "sug.1": ["Explain how photosynthesis works in simple terms", "Fotosintez qanday ishlashini oddiy so‘zlar bilan tushuntiring", "Wyjaśnij prostymi słowami, jak działa fotosynteza", "Простыми словами объясни, как работает фотосинтез"],
        "sug.2": ["Help me write a polite email asking for a deadline extension", "Muddatni uzaytirishni so‘rab, xushmuomala xat yozishimga yordam bering", "Pomóż mi napisać uprzejmy e-mail z prośbą o przedłużenie terminu", "Помоги написать вежливое письмо с просьбой о продлении срока"],
        "sug.3": ["Show me a JavaScript function that debounces another function", "Boshqa funksiyani debounce qiladigan JavaScript funksiyasini ko‘rsating", "Pokaż funkcję JavaScript, która robi debounce innej funkcji", "Покажи функцию на JavaScript, которая делает debounce другой функции"],
        "sug.4": ["Suggest a quick vegetarian dinner I can cook in 20 minutes", "20 daqiqada pishira oladigan tez vegetarian kechki ovqat taklif qiling", "Zaproponuj szybką wegetariańską kolację do ugotowania w 20 minut", "Предложи быстрый вегетарианский ужин, который можно приготовить за 20 минут"],
        "chat.imageQuestion": ["What can you tell me about this image?", "Bu rasm haqida nima deya olasiz?", "Co możesz mi powiedzieć o tym obrazie?", "Что можешь рассказать об этом изображении?"],
        "chat.imageAttached": ["Image attached", "Rasm biriktirilgan", "Dołączono obraz", "Изображение прикреплено"],
        "chat.copy": ["Copy answer", "Javobni nusxalash", "Kopiuj odpowiedź", "Копировать ответ"],
        "chat.copied": ["Copied to clipboard", "Nusxalandi", "Skopiowano do schowka", "Скопировано в буфер обмена"],
        "chat.copyFail": ["Could not copy", "Nusxalab bo‘lmadi", "Nie udało się skopiować", "Не удалось скопировать"],
        "chat.today": ["Today", "Bugun", "Dzisiaj", "Сегодня"],
        "chat.yesterday": ["Yesterday", "Kecha", "Wczoraj", "Вчера"],
        "chat.week": ["Previous 7 days", "Oldingi 7 kun", "Poprzednie 7 dni", "Предыдущие 7 дней"],
        "chat.older": ["Older", "Eskiroq", "Starsze", "Ранее"],
        "chat.noMatch": ["No chats match your search.", "Qidiruv bo‘yicha chat topilmadi.", "Brak czatów pasujących do wyszukiwania.", "Нет чатов, подходящих под поиск."],
        "chat.noChats": ["No conversations yet.<br>Start one below!", "Hozircha suhbatlar yo‘q.<br>Quyida boshlang!", "Brak rozmów.<br>Zacznij jedną poniżej!", "Пока нет разговоров.<br>Начните новый ниже!"],
        "chat.delete": ["Delete chat", "Chatni o‘chirish", "Usuń czat", "Удалить чат"],
        "chat.confirmDelete": ["Delete \"{title}\"? This can't be undone.", "\"{title}\" o‘chirilsinmi? Buni qaytarib bo‘lmaydi.", "Usunąć „{title}”? Tej operacji nie można cofnąć.", "Удалить «{title}»? Это нельзя отменить."],
        "chat.confirmClear": ["Delete ALL your chat history? This can't be undone.", "Butun chat tarixingiz o‘chirilsinmi? Buni qaytarib bo‘lmaydi.", "Usunąć CAŁĄ historię czatów? Tej operacji nie można cofnąć.", "Удалить ВСЮ историю чатов? Это нельзя отменить."],
        "chat.nothingToClear": ["There's no history to clear.", "Tozalash uchun tarix yo‘q.", "Nie ma historii do wyczyszczenia.", "Нет истории для очистки."],
        "chat.notImage": ["Please choose an image file.", "Iltimos, rasm faylini tanlang.", "Wybierz plik obrazu.", "Пожалуйста, выберите файл изображения."],
        "chat.tooBig": ["Image is too large (max 8 MB).", "Rasm juda katta (maks. 8 MB).", "Obraz jest za duży (maks. 8 MB).", "Изображение слишком большое (макс. 8 МБ)."],
        "chat.storageFull": ["Storage is full, so this chat could not be saved.", "Xotira to‘lgan, shuning uchun bu chatni saqlab bo‘lmadi.", "Pamięć jest pełna, więc nie udało się zapisać tego czatu.", "Хранилище заполнено, поэтому этот чат не удалось сохранить."],
        "chat.wrong": ["Something went wrong.", "Nimadir xato ketdi.", "Coś poszło nie tak.", "Что-то пошло не так."],

        // ----- API errors -----
        "api.noKey": ["No API key set yet. Add it to js/config.js.", "API kaliti hali kiritilmagan. Uni js/config.js ga qo‘shing.", "Nie ustawiono jeszcze klucza API. Dodaj go w js/config.js.", "Ключ API ещё не задан. Добавьте его в js/config.js."],
        "api.network": ["Network error. Check your connection and try again.", "Tarmoq xatosi. Ulanishni tekshirib, qayta urinib ko‘ring.", "Błąd sieci. Sprawdź połączenie i spróbuj ponownie.", "Ошибка сети. Проверьте соединение и попробуйте снова."],
        "api.failed": ["Request failed ({status}).", "So‘rov bajarilmadi ({status}).", "Żądanie nie powiodło się ({status}).", "Запрос не выполнен ({status})."],
        "api.empty": ["The model returned an empty response. Try rephrasing.", "Model bo‘sh javob qaytardi. Savolni boshqacha yozib ko‘ring.", "Model zwrócił pustą odpowiedź. Spróbuj przeformułować pytanie.", "Модель вернула пустой ответ. Попробуйте переформулировать."],
    };

    // Words for the landing page typing animation
    const TYPED = {
        en: ["Hi there...", "Hello...", "Hey..."],
        uz: ["Salom...", "Assalomu alaykum...", "Xush kelibsiz..."],
        pl: ["Cześć...", "Witaj...", "Hej..."],
        ru: ["Привет...", "Здравствуйте...", "Добро пожаловать..."],
    };

    const listeners = [];

    function pick() {
        let saved = null;
        try { saved = localStorage.getItem(KEY); } catch (e) { /* storage blocked */ }
        if (CODES.includes(saved)) return saved;
        const nav = String(navigator.language || "en").slice(0, 2).toLowerCase();
        return CODES.includes(nav) ? nav : "en";
    }
    let lang = pick();

    function t(key, vars) {
        const row = T[key];
        if (!row) return key;
        let s = row[CODES.indexOf(lang)] || row[0];
        if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
        return s;
    }

    const ATTRS = [["placeholder", "placeholder"], ["aria", "aria-label"], ["title", "title"], ["alt", "alt"], ["content", "content"]];

    function apply(root) {
        root = root || document;
        root.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.getAttribute("data-i18n")); });
        root.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.getAttribute("data-i18n-html")); });
        ATTRS.forEach(([suffix, attr]) => {
            root.querySelectorAll("[data-i18n-" + suffix + "]").forEach((el) => {
                el.setAttribute(attr, t(el.getAttribute("data-i18n-" + suffix)));
            });
        });
    }

    /* ----- language dropdown ----- */
    function closeAll() {
        document.querySelectorAll("[data-lang-switch]").forEach((host) => {
            const menu = host.querySelector(".lang-menu");
            if (!menu) return;
            menu.hidden = true;
            host.removeAttribute("data-open");
            host.querySelector(".lang-btn").setAttribute("aria-expanded", "false");
        });
    }

    function buildSwitches() {
        document.querySelectorAll("[data-lang-switch]").forEach((host) => {
            if (host.dataset.built) return;
            host.dataset.built = "1";
            host.classList.add("lang");
            host.innerHTML =
                '<button type="button" class="lang-btn" aria-haspopup="listbox" aria-expanded="false">' +
                '<span class="ms">translate</span><span class="lang-code"></span><span class="ms caret">expand_more</span></button>' +
                '<ul class="lang-menu" role="listbox" hidden></ul>';
            const btn = host.querySelector(".lang-btn");
            const menu = host.querySelector(".lang-menu");
            LANGS.forEach(([code, name]) => {
                const li = document.createElement("li");
                li.setAttribute("role", "presentation");
                li.innerHTML = '<button type="button" role="option" data-lang="' + code + '"><span></span><span class="ms">check</span></button>';
                li.querySelector("span").textContent = name;
                menu.appendChild(li);
            });
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const open = menu.hidden;
                closeAll();
                menu.hidden = !open;
                host.toggleAttribute("data-open", open);
                btn.setAttribute("aria-expanded", String(open));
            });
            menu.addEventListener("click", (e) => {
                const b = e.target.closest("[data-lang]");
                if (!b) return;
                setLang(b.dataset.lang);
                btn.focus();
            });
        });
    }

    function refreshSwitches() {
        document.querySelectorAll("[data-lang-switch]").forEach((host) => {
            const code = host.querySelector(".lang-code");
            if (!code) return;
            code.textContent = lang.toUpperCase();
            host.querySelector(".lang-btn").setAttribute("aria-label", t("common.language"));
            host.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.lang === lang)));
        });
    }

    function setLang(code) {
        if (!CODES.includes(code)) return;
        lang = code;
        try { localStorage.setItem(KEY, code); } catch (e) { /* ignore */ }
        document.documentElement.lang = code;
        apply();
        refreshSwitches();
        listeners.forEach((fn) => fn(code));
    }

    document.addEventListener("click", closeAll);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });

    document.documentElement.lang = lang;
    buildSwitches();
    apply();
    refreshSwitches();

    return {
        t,
        apply,
        setLang,
        getLang: () => lang,
        onChange: (fn) => listeners.push(fn),
        typedWords: () => TYPED[lang] || TYPED.en,
        LANGS,
        _table: T,
    };
})();
