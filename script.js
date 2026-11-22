const BOOKS=[
['The Guide','R. K. Narayan','Fiction',3],
['Train to Pakistan','Khushwant Singh','Fiction',2],
["Midnight’s Children",'Salman Rushdie','Fiction',1],
['A Brief History of Time','Stephen Hawking','Science',2],
['Cosmos','Carl Sagan','Science',2],
['The Selfish Gene','Richard Dawkins','Science',1],
['India After Gandhi','Ramachandra Guha','History',2],
['The Discovery of India','Jawaharlal Nehru','History',2],
['Sapiens','Yuval Noah Harari','History',3],
['Clean Code','Robert C. Martin','Technology',2],
['The Pragmatic Programmer','Hunt & Thomas','Technology',2],
['Designing Data-Intensive Applications','Martin Kleppmann','Technology',1],
['Modern PHP','Josh Lockhart','Technology',2],
['Learning PHP, MySQL & JavaScript','Robin Nixon','Technology',2],
['Meditations','Marcus Aurelius','Philosophy',2],
['The Republic','Plato','Philosophy',1],
['Wings of Fire','A. P. J. Abdul Kalam','Biography',3],
['The Story of My Experiments with Truth','M. K. Gandhi','Biography',2],
['The Merchant of Venice','William Shakespeare','Drama',3],
['Romeo and Juliet','William Shakespeare','Drama',2],
['The Ramayana','Valmiki','Mythology',3],
['The Ramayana (Retold)','R. K. Narayan','Mythology',2],
['Amazing Spider-Man','Stan Lee & Steve Ditko','Comics',3],
['The Avengers','Stan Lee & Jack Kirby','Comics',2],
['X-Men','Stan Lee & Jack Kirby','Comics',2]
].map((x,i)=>({
id:i+1,
title:x[0],
author:x[1],
category:x[2],
copies:x[3]
}));


const EPS=[
[
'Welcome to the Reading Room',
'The Library Team',
'Welcome to the Reading Room podcast. Each week we talk about books, reading habits and the people who make a library work. Find a comfortable seat, bring a cup of tea, and let’s begin.'
],
[
'Ten minutes a day',
'Reading coach',
'Reading does not need a free afternoon. Ten minutes a day adds up to about five hours every month. Keep a book near your bed, read one chapter before sleeping, and mark where you stopped. Small habits turn into finished books.'
],
[
'How to choose your next book',
'Library staff',
'Start with a topic you already enjoy. Read the first page before you decide. If a book has not held your attention after fifty pages, it is fine to put it down. Ask a friend or a librarian for a recommendation, then try one book outside your usual shelf.'
],
[
'Inside a library',
'Library staff',
'Every book on the shelf has a story. It is chosen, recorded, labelled and placed by category so that you can find it quickly. When you return a book on time, the next reader can enjoy it too.'
],
[
'Reading for exams',
'Study tips',
'Read with a pencil in hand. Write one summary line after each section. Explain the idea aloud as if you were teaching a friend. Review your notes the next day, and again after a week.'
],
[
'Reading aloud',
'Reading coach',
'Reading aloud slows you down and helps you notice rhythm and sound. Try a short poem or a paragraph from a favourite story. Record yourself once, listen back, and enjoy how the words feel.'
]
];


const PLANS={
Free:{
price:0,
loan:14,
max:2,
seats:1,
pods:3,
perks:[
'Borrow up to 2 books',
'14-day loan period',
'1 seat booking at a time',
'First 3 podcast episodes'
]
},

Student:{
price:199,
loan:21,
max:5,
seats:3,
pods:99,
perks:[
'Borrow up to 5 books',
'21-day loan period',
'3 seat bookings at a time',
'All podcast episodes'
]
},

Premium:{
price:499,
loan:30,
max:10,
seats:5,
pods:99,
perks:[
'Borrow up to 10 books',
'30-day loan period',
'5 seat bookings at a time',
'All podcast episodes'
]
}
};


function seed(){
return{
books:JSON.parse(JSON.stringify(BOOKS)),
loans:[],
users:[],
session:null,
bookReviews:[],
serviceFeedback:[],
requests:[],
feedback:[],
bookings:[],
dues:[],
payments:[],
day:0
};
}


let S=
JSON.parse(
localStorage.getItem('readingRoomState')||'null'
)||seed();


if(!S.books?.length)
S.books=JSON.parse(JSON.stringify(BOOKS));


const $=id=>document.getElementById(id);


const esc=s=>
String(s??'').replace(
/[&<>"']/g,
m=>({
'&':'&amp;',
'<':'&lt;',
'>':'&gt;',
'"':'&quot;',
"'":'&#39;'
}[m])
);


const save=()=>
localStorage.setItem(
'readingRoomState',
JSON.stringify(S)
);


const me=()=>
S.users.find(
u=>u.email===S.session
);


const planName=()=>
me()?.plan||'Free';


const plan=()=>
PLANS[planName()];


const avail=b=>
b.copies-
S.loans.filter(
l=>l.bookId===b.id
).length;


const bookOf=l=>
S.books.find(
b=>b.id===l.bookId
);


const toast=m=>{
let t=$('toast');

if(t){
t.textContent=m;
t.classList.add('show');

setTimeout(
()=>t.classList.remove('show'),
2600
);
}
};


function nav(){

document
.querySelectorAll('nav a')
.forEach(a=>{

if(
a.getAttribute('href')===
location.pathname.split('/').pop()
||
a.getAttribute('href')==='index.html'
&&
location.pathname.endsWith('/')
)
a.classList.add('active');

});

}


function stats(){

const total=
S.books.reduce(
(a,b)=>a+b.copies,
0
);

const available=
S.books.reduce(
(a,b)=>a+avail(b),
0
);

if($('statTotal'))
$('statTotal').textContent=total;

if($('statAvail'))
$('statAvail').textContent=available;

if($('statOut'))
$('statOut').textContent=
total-available;

if($('statLate'))
$('statLate').textContent=0;

}


function selected(){

return S.books.find(
b=>b.id==localStorage.getItem('selectedBook')
)||S.books[0];

}


function addBookFromForm(){

const title=
$('newTitle')?.value.trim();

const author=
$('newAuthor')?.value.trim();

const category=
$('newCategory')?.value.trim()||
'General';

const copies=
+$('newCopies')?.value||1;

if(!title||!author)
return alert(
'Title and author are required.'
);

S.books.push({
id:
Math.max(
0,
...S.books.map(b=>b.id)
)+1,

title,
author,
category,
copies:Math.max(1,copies)
});

save();

location.href='books.html';

}


function renderBooks(){

const box=$('bookGrid');

if(!box)
return;

const q=
($('search')?.value||'')
.toLowerCase();

const cat=
window.activeCat||'All';

const list=
S.books.filter(
b=>
(cat==='All'||b.category===cat)
&&
(b.title+' '+b.author+' '+b.category)
.toLowerCase()
.includes(q)
);


box.innerHTML=
list.map(b=>`

<div class="card">

<div class="cover">

<span>
${esc(b.title)}
</span>

<small>
${esc(b.author)}
</small>

</div>

<h3>${esc(b.title)}</h3>

<p>${esc(b.author)}</p>

<p>
<b>Category:</b>
${esc(b.category)}
</p>

<p>
<b>Copies:</b>
${b.copies}
•
<b>Available:</b>
${avail(b)}
</p>

<a
class="btn"
href="book.html"
onclick="localStorage.setItem('selectedBook','${b.id}')">
View Details
</a>

</div>

`).join('')

||
'<p class="muted">No books match your search.</p>';


const chips=$('chips');

if(chips)
chips.innerHTML=
[
'All',
...new Set(
S.books.map(b=>b.category)
)
]
.map(c=>`

<button
class="chip ${cat===c?'active':''}"
onclick="activeCat='${c}';renderBooks()">
${esc(c)}
</button>

`)
.join('');

}


let bookRating=0;


function renderBook(){

const b=selected();

const box=$('bookDetail');

if(!box)
return;

const reviews=
S.bookReviews.filter(
r=>r.bookId===b.id
);

const avg=
reviews.length
?
(
reviews.reduce(
(a,r)=>a+r.rating,
0
)/reviews.length
).toFixed(1)
:
'No ratings yet';


box.innerHTML=`

<div class="two">

<div class="cover">

<span>
${esc(b.title)}
</span>

<small>
${esc(b.author)}
</small>

</div>


<div>

<h1>${esc(b.title)}</h1>

<h3>${esc(b.author)}</h3>

<p>
Category:
<b>${esc(b.category)}</b>
</p>

<p>
Copies:
<b>${b.copies}</b>
•
Available:
<b>${avail(b)}</b>
</p>

<p>
<b>Book rating:</b>
${avg}
${reviews.length?' ★':''}
</p>

<p class="muted">
Find this title in the Reading Room collection.
Members can issue available copies according to their membership limit.
</p>

<button
class="btn"
onclick="startBorrow(${b.id})">
Borrow this book
</button>

<button
class="btn secondary"
onclick="location.href='books.html'">
Back to Books
</button>

</div>

</div>


<hr>


<section>

<h2>Feedback for this book</h2>

<p class="small muted">
Rate this specific book and share your experience.
</p>

<div class="rating">

${[1,2,3,4,5]
.map(i=>`

<button
type="button"
onclick="setBookRating(${i})">
★
</button>

`)
.join('')}

</div>


<input
id="bookReviewText"
placeholder="Write your feedback about this book">


<button
class="btn"
onclick="submitBookFeedback(${b.id})">
Submit Book Feedback
</button>


<div>

${
reviews
.slice()
.reverse()
.map(r=>`

<div class="review">

<b>${esc(r.name)}</b>
•
${'★'.repeat(r.rating)}

<br>

${esc(r.text)}

</div>

`)
.join('')
||
'<p class="muted">No book feedback yet.</p>'
}

</div>

</section>

`;

}


function setBookRating(n){

bookRating=n;

document
.querySelectorAll('.rating button')
.forEach(
(b,i)=>
b.textContent=
i<n?'★':'☆'
);

}


function submitBookFeedback(id){

if(!me()){
location.href='login.html';
return;
}

const text=
$('bookReviewText')?.value.trim();

if(!bookRating||!text)
return alert(
'Choose a rating and write feedback.'
);

S.bookReviews.push({
id:Date.now(),
bookId:id,
name:me().name,
rating:bookRating,
text
});

bookRating=0;

save();

renderBook();

toast(
'Book feedback submitted.'
);

}


function startBorrow(id){

localStorage.setItem(
'selectedBook',
id
);

location.href='borrow.html';

}


function renderBorrow(){

const b=selected();

const box=$('borrowBox');

if(!box)
return;

box.innerHTML=`

<h1>
Borrow:
${esc(b.title)}
</h1>

<p>
Author:
${esc(b.author)}
•
Available copies:
${avail(b)}
</p>

<p>
Your ${planName()} plan allows up to
${plan().max} books at a time and
${plan().loan}-day loans.
</p>

<input
id="borrower"
placeholder="Member name"
value="${esc(me()?.name||'')}">

<p
id="borrowErr"
class="error">
</p>

<button
class="btn"
onclick="confirmBorrow(${b.id})">
Confirm borrow
</button>

`;

}


function confirmBorrow(id){

if(!me()){
location.href='login.html';
return;
}

const b=
S.books.find(
x=>x.id===id
);

const err=$('borrowErr');

if(!b||avail(b)<=0){
err.textContent=
'No copies are available.';
return;
}

if(
S.loans.filter(
l=>l.email===S.session
).length
>=plan().max
){

err.textContent=
`Your ${planName()} plan allows ${plan().max} books.`;

return;
}

S.loans.push({
id:Date.now(),
bookId:id,
email:S.session,
member:me().name,
issued:S.day,
due:S.day+plan().loan
});

save();

toast(
'Book issued successfully.'
);

setTimeout(
()=>location.href='account.html',
500
);

}


function renderMembership(){

const box=$('plans');

if(!box)
return;

const cur=planName();

box.innerHTML=
Object.entries(PLANS)
.map(
([n,p])=>`

<div
class="plan ${n===cur?'current':''}">

<h2>${n}</h2>

<div class="price">

${
p.price
?
'₹'+p.price+'<small>/month</small>'
:
'Free'
}

</div>

<ul>

${p.perks
.map(
x=>`<li>${esc(x)}</li>`
)
.join('')}

</ul>

<button
class="btn"
${n===cur?'disabled':''}
onclick="choosePlan('${n}')">

${
n===cur
?
'Current plan'
:
p.price
?
'Choose '+n
:
'Switch to Free'
}

</button>

</div>

`
)
.join('');

}


function choosePlan(n){

if(n==='Free'){

if(me()){
me().plan='Free';
save();
}

return renderMembership();

}

localStorage.setItem(
'pendingPlan',
n
);

location.href='payment.html';

}


const SEAT_TIMES=[
'9:00 AM - 11:00 AM',
'11:00 AM - 1:00 PM',
'1:00 PM - 3:00 PM',
'3:00 PM - 5:00 PM',
'5:00 PM - 7:00 PM',
'7:00 PM - 9:00 PM'
];


let selectedSlot=
localStorage.getItem('selectedSlot')
||
SEAT_TIMES[0];

localStorage.setItem(
'selectedSlot',
selectedSlot
);


function renderSeats(){

const box=$('seats');

if(!box)
return;

box.innerHTML=`

<div class="seat-info">

<label>

Date

<input
id="seatDate"
type="date"
value="${
localStorage.getItem('seatDate')
||
new Date().toISOString().slice(0,10)
}">

</label>


<label>

Timing

<select id="seatTime">

${SEAT_TIMES
.map(
t=>`

<option
${t===selectedSlot?'selected':''}>
${t}
</option>

`
)
.join('')}

</select>

</label>

</div>


<div
class="seat-grid"
id="seatGrid">
</div>


<p class="muted small">
Choose a date, timing and available seat.
</p>

`;


const grid=$('seatGrid');


for(
const r of ['A','B','C','D']
)

for(
let n=1;
n<=6;
n++
){

const seat=r+n;

const b=
document.createElement('button');

const taken=
S.bookings.some(
x=>
x.date===
localStorage.getItem('seatDate')
&&
x.slot===selectedSlot
&&
x.seat===seat
);

b.className=
'seat'+
(taken?' taken':'');

b.textContent=seat;

b.disabled=taken;

b.onclick=()=>{

document
.querySelectorAll(
'#seatGrid .seat'
)
.forEach(
x=>x.classList.remove('selected')
);

b.classList.add('selected');

localStorage.setItem(
'selectedSeat',
seat
);

};

grid.appendChild(b);

}


$('seatDate').onchange=e=>{

localStorage.setItem(
'seatDate',
e.target.value
);

renderSeats();

};


$('seatTime').onchange=e=>{

selectedSlot=e.target.value;

localStorage.setItem(
'selectedSlot',
selectedSlot
);

localStorage.removeItem(
'selectedSeat'
);

renderSeats();

};

}


function bookSeat(){

if(!me()){
location.href='login.html';
return;
}

const s=
localStorage.getItem('selectedSeat');

const date=
localStorage.getItem('seatDate');

const slot=
localStorage.getItem('selectedSlot');

if(!s||!date||!slot)
return alert(
'Select date, timing and seat first.'
);

if(
S.bookings.some(
b=>
b.email===S.session
&&
b.date===date
&&
b.slot===slot
)
)
return alert(
'You already have a booking for this timing.'
);

S.bookings.push({
id:Date.now(),
email:S.session,
seat:s,
date,
slot
});

save();

toast(
'Seat '+s+' booked for '+slot
);

renderSeats();
renderAccount();

}


function renderPodcasts(){

const box=$('episodes');

if(!box)
return;

const limit=plan().pods;

box.innerHTML=
EPS.map(
(e,i)=>`

<div class="list-row">

<div>

<b>
${i+1}. ${esc(e[0])}
</b>

<div class="muted">
${esc(e[1])}
</div>

</div>

<button
class="btn"
onclick="playEpisode(${i})">

${i>=limit?'Upgrade to listen':'Play'}

</button>

</div>

`
)
.join('');

}


function playEpisode(i){

if(i>=plan().pods){
location.href='membership.html';
return;
}

speechSynthesis.cancel();

speechSynthesis.speak(
new SpeechSynthesisUtterance(
EPS[i][2]
)
);

}


function stopPodcast(){

speechSynthesis.cancel();

}


function renderPayment(){

const p=
localStorage.getItem('pendingPlan')
||
'Free';

const box=$('paymentBox');

if(!box)
return;

const amount=
PLANS[p]?.price||0;

box.innerHTML=`

<h1>Payment</h1>

<p>
Selected plan:
<b>${p}</b>
</p>

<p class="price">
₹${amount}
</p>

<select id="method">

<option>UPI</option>
<option>Card</option>
<option>Net Banking</option>

</select>

<input
id="payRef"
placeholder="Demo payment ID / UPI ID">

<p class="notice">

Demo only:
no real money is charged or sent anywhere.

</p>

<button
class="btn"
onclick="completePayment('${p}',${amount})">

Pay now

</button>

`;

}


function completePayment(p,amount){

if(!me()){
location.href='login.html';
return;
}

if(!$('payRef').value.trim())
return alert(
'Enter a demo payment ID / UPI ID.'
);

me().plan=p;

me().until=
new Date(
Date.now()+30*86400000
).toLocaleDateString('en-IN');

S.payments.push({
id:Date.now(),
email:S.session,
plan:p,
amount,
method:$('#method').value
});

localStorage.removeItem(
'pendingPlan'
);

save();

alert(
`Payment successful! ₹${amount} — demo only.`
);

location.href='account.html';

}


function login(){

const name=
$('name')?.value.trim();

const email=
$('email')?.value.trim().toLowerCase();

const password=
$('password')?.value;


if(!email||!password)
return alert(
'Enter email and password.'
);


let u=
S.users.find(
x=>x.email===email
);


if(u){

if(u.password!==password)
return alert(
'Incorrect password.'
);

if(name&&u.name!==name)
u.name=name;

}

else{

if(!name)
return alert(
'Enter your name to create an account.'
);

const uid=
'RR'+
Date.now()
.toString()
.slice(-8);

u={
name,
email,
password,
memberId:uid,
plan:'Free'
};

S.users.push(u);

}


S.session=email;

save();

location.href='account.html';

}


function logout(){

S.session=null;

save();

location.href='index.html';

}


function renderAccount(){

const box=$('accountBox');

if(!box)
return;

if(!me()){

box.innerHTML=`

<div class="notice">

Please
<a href="login.html">login</a>
to view your account.

</div>

`;

return;

}


const loans=
S.loans.filter(
l=>l.email===S.session
);

const bookings=
S.bookings.filter(
b=>b.email===S.session
);


box.innerHTML=`

<h1>My Account</h1>

<p>
Welcome,
<b>${esc(me().name)}</b>
</p>

<p>
Email:
${esc(me().email)}
</p>

<p>
Member ID:

<span class="id-badge">

${esc(
me().memberId||
'RR'+
String(me().email.length)
.padStart(8,'0')
)}

</span>

</p>

<p>
Membership:
<b>${planName()}</b>
</p>


<h2>My Loans</h2>

${
loans.map(
l=>`

<div class="list-row">

<span>

${esc(
bookOf(l)?.title||
'Book'
)}

• due in
${Math.max(
0,
l.due-S.day
)}
day(s)

</span>

<button
class="btn"
onclick="returnBook(${l.id})">

Return

</button>

</div>

`
)
.join('')
||
'<p class="muted">No issued books.</p>'
}


<h2>My Seat Bookings</h2>

${
bookings.map(
b=>`

<div class="list-row">

Seat ${b.seat}
• ${b.date}
• ${b.slot}

</div>

`
)
.join('')
||
'<p class="muted">No bookings.</p>'
}


<h2>Payments</h2>

${
S.payments
.filter(
p=>p.email===S.session
)
.map(
p=>`

<div class="list-row">

${p.plan}
• ₹${p.amount}
• ${p.method}

</div>

`
)
.join('')
||
'<p class="muted">No payments yet.</p>'
}


<button
class="btn danger"
onclick="logout()">

Sign out

</button>

`;

}


function returnBook(id){

S.loans=
S.loans.filter(
l=>l.id!==id
);

save();

renderAccount();

toast(
'Book returned.'
);

}


function requestBook(){

const title=
$('rTitle')?.value.trim();

const author=
$('rAuthor')?.value.trim()
||
'Unknown';

if(!title)
return alert(
'Enter a book title.'
);

S.requests.push({
id:Date.now(),
title,
author,
votes:0
});

save();

renderRequests();

}


function renderRequests(){

const box=$('requestList');

if(!box)
return;

box.innerHTML=
S.requests.map(
r=>`

<div class="list-row">

<span>

<b>${esc(r.title)}</b>
•
${esc(r.author)}
•
Votes: ${r.votes}

</span>

<button
class="btn"
onclick="voteRequest(${r.id})">

Vote

</button>

</div>

`
)
.join('')
||
'<p class="muted">No requests yet.</p>';

}


function voteRequest(id){

const r=
S.requests.find(
x=>x.id===id
);

if(r){

r.votes++;

save();

renderRequests();

}

}


function sendFeedback(){

const text=
$('fbText')?.value.trim();

const rating=
+$('rating')?.value||0;

if(!text||!rating)
return alert(
'Choose a rating and write feedback.'
);

S.feedback.push({
name:me()?.name||'Anonymous',
rating,
text
});

save();

$('fbText').value='';

renderFeedback();

toast(
'Thank you for your feedback.'
);

}


function renderFeedback(){

const box=$('feedbackList');

if(!box)
return;

box.innerHTML=
S.feedback.map(
f=>`

<div class="list-row">

<span>

<b>${esc(f.name)}</b>
•
${'★'.repeat(f.rating)}

<br>

${esc(f.text)}

</span>

</div>

`
)
.join('')
||
'<p class="muted">No feedback yet.</p>';

}


function submitServiceFeedback(){

if(!me()){
location.href='login.html';
return;
}

const text=
$('serviceText')?.value.trim();

const rating=
+$('serviceRating')?.value||0;

if(!text||!rating)
return alert(
'Choose a service rating and write feedback.'
);

S.serviceFeedback.push({
id:Date.now(),
name:me().name,
rating,
text,
date:new Date()
.toLocaleDateString('en-IN')
});

save();

$('serviceText').value='';

$('serviceRating').value='';

renderServiceFeedback();

toast(
'Service feedback submitted.'
);

}


function renderServiceFeedback(){

const box=
$('serviceFeedbackList');

if(!box)
return;

box.innerHTML=
S.serviceFeedback
.slice()
.reverse()
.map(
f=>`

<div class="review">

<b>${esc(f.name)}</b>
•
${'★'.repeat(f.rating)}

<br>

${esc(f.text)}

<div class="small muted">
${esc(f.date)}
</div>

</div>

`
)
.join('')
||
'<p class="muted">No service feedback yet.</p>';

}


function init(){

nav();

stats();

renderBooks();

renderBook();

renderBorrow();

renderMembership();

renderSeats();

renderPodcasts();

renderPayment();

renderAccount();

renderRequests();

renderFeedback();

renderServiceFeedback();

if($('search'))
$('search').addEventListener(
'input',
renderBooks
);
}
init();
