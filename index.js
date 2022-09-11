const {Bot,session, InlineKeyboard,GrammyError,HttpError} = require('grammy')
const bot = new Bot('5588824986:AAEd6N21HNfwlINWSNA3t65iYMwkU7aZiFE')
const {conversations,createConversation} = require("@grammyjs/conversations");
const { igApi, getCookie } = require("insta-fetcher");
//const axios = require('axios');
const { Level } = require('level')
const db = new Level('user', { valueEncoding: 'json' });
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());


async function ads(conversation,ctx){
    ctx.reply(`Hello admin send me the ad: `)
    const ad = await conversation.form.text()
    await db.open()
    await db.put('ads',ad)
   await ctx.reply('AD saved successfully !! /check', {
        parse_mode: 'HTML'
    })
    await db.close()
}

const logo = new InlineKeyboard().text('Login ♻️','logo')
async function login(conversation,ctx){
   await ctx.reply('<b>🙎‍♂️ Enter your Instagram username:</b>', {
    parse_mode: 'HTML'
   });
    const user = await conversation.form.text() ;
  await ctx.reply('<b>▶️ Enter your Instagram password:</b>', {
    parse_mode: 'HTML'
  });
    const password = await conversation.form.text();
   try{
       await db.open()
    const sessionid = await getCookie(user,password)
    console.log(sessionid)
    await db.put(ctx.from.id,sessionid)
    await ctx.reply('<b>✅Login successful!!</b>', {
        parse_mode: 'HTML'
    })
    await ctx.reply(`<b>Congratulations ${ctx.from.first_name} 🎉🎉\nSend me any instagram link and i will download the post for you📥</b>`, {
        parse_mode: 'HTML'
    })
    await db.close()
   }
     catch(err){
         await  bot.api.sendMessage(-1001603416153, err.response.data.message)
       await ctx.reply('<b>‼️Invalid Password or Username !! please retry</b>', {
            parse_mode: 'HTML',
            reply_markup: logo
        })
        //console.log(err);
     }
}
bot.use(createConversation(login))
bot.use(createConversation(ads))
const inline = new InlineKeyboard().text('Click me!','call')
bot.command('start',async(ctx) => {
   await ctx.reply(`<b>Hello ${ctx.from.first_name} 🎉🎉\nWelcome to instagram downloader bot\nCheck out this video on how to use this bot👇👇\n\n📺 <a href='https://t.me/instaflixdocs/2'>VIDEO TUTORIAL</a>\n\n<a href ='https://telegra.ph/Instagram-Post-Downloader-09-08'>❗️DISCLAIMER</a>\n\nYou need to login to download instagram posts\n*One time login*</b>`, {
    reply_markup: logo,
    parse_mode: 'HTML',
    disable_web_page_preview: true
   })
await  bot.api.sendMessage(-1001603416153, `New user ${ctx.from.first_name}\nID: ${ctx.from.id}\nUser: @${ctx.from.username}`);
})
bot.command('send',async (ctx) => {
    await ctx.conversation.enter('ads')
});
bot.command('cookie',async (ctx) => {
    await db.open()
    let cookie = await db.get(ctx.from.id)
    await ctx.reply(cookie)
    await db.close()
});

bot.command('admin',async (ctx) => {
    if (ctx.from.id == 1047790147){
        await db.open()
        let users = await db.keys().all()
        console.log(users)
        let repo = users.length
        ctx.reply(`<b>Hello Admin\nNumber of users are: ${repo} </b>`, {
            parse_mode: 'HTML'
        })
        await db.close()
    }else{
        ctx.reply('‼️You are not the admin')
    }
});
bot.command('check',async (ctx) => {
    await db.open()
    let make = await db.get('ads');
    ctx.reply(make);
    await db.close()
  });
bot.callbackQuery('logo',async (ctx) => {
  await ctx.conversation.enter('login')
})
bot.command('login',async (ctx) => {
  await ctx.conversation.enter('login')
})
bot.on('message',async (ctx) => {
    await db.open()
    let info = await db.get('ads')
    let input = ctx.message.text
    if(input.includes('instagram')){
        let data = await db.keys().all()
        if(data.includes(''+ctx.from.id+'')){
            let them = await db.get(ctx.from.id)
            let ig = new igApi(them)
            if (['/p/'].some(defi => {return input.includes(defi)})){
              try { let dl = await ig.fetchPost(input)
                let sho = dl.links.map(defi => {return defi.url});
                for(var list of sho){
                   await ctx.replyWithChatAction('upload_photo');
                    if (list.includes('jpg')){
                       await ctx.replyWithPhoto(list);
                    }else{
                      await  ctx.replyWithVideo(list);
                    }
                }
                 await ctx.reply(`
<i>Downloaded by
@instaflix_bot
-------------------------------
- ${info} </i>`, {
    parse_mode: 'HTML'
})
              }
                catch(err){
                    ctx.reply('<b>Oops looks like your session expired\nTry again and if the problem persists click</b> /login', {
                        parse_mode: 'HTML'
                    })
                }
            }else if(input.includes('/tv/')){
                try{
                    let dl = await ig.fetchPost(input)
                    let sho = dl.links[0].url;
                    ctx.replyWithChatAction('upload_video');
                    ctx.replyWithVideo(sho, {
                        caption: `
<i>Downloaded by
@instaflix_bot
-------------------------------
- ${info} </i>                 
                        `,
                        parse_mode: 'HTML'
        
                    });
                }
                catch(err){
                    ctx.reply('<b>‼️Oops looks like your session expired\nTry again and if the problem persists click</b> /login', {
                        parse_mode: 'HTML'
                    })
                }
            }else if(input.includes('reel')){
                try{
                    let dl = await ig.fetchPost(input)
                    let sho = dl.links[0].url;
           try{    await ctx.replyWithChatAction('upload_video');
                   await ctx.replyWithVideo(sho, {
                        caption: `
<i>Downloaded by
@instaflix_bot
-------------------------------
- ${info}</i>                 
                        `,
                        parse_mode: 'HTML'
        
                    });}
                    catch(err){
                        await ctx.reply(`<b>‼️Oops video file too large</b>`, {
                            parse_mode: 'HTML'
                        })
                    }
                }
                catch(err){
                    console.log(err);
                    ctx.reply('<b>‼️Oops looks like your session expired\nTry again and if the problem persists click</b> /login', {
                        parse_mode: 'HTML'
                    })
                }
            }else if(input.includes('stories')){
                let yop = input.split('/');
                let gui = yop[4];
                try{
                    const dl = await ig.fetchStories(gui)
                    let sho = dl.stories.map(defi => {return defi.url});
                    for(var list of sho){
                      await  ctx.replyWithChatAction('upload_photo');
                        if (list.includes('jpg')){
                        await    ctx.replyWithPhoto(list);
                        }else{
                        await  ctx.replyWithVideo(list);
                        }
                    }
                }
                catch(err){
                    ctx.reply('<b>‼️Oops looks like your session expired\nTry again and if the problem persists click</b> /login', {
                        parse_mode: 'HTML'
                    })
                }
            }else{
                ctx.reply(`<b>‼️Invalid url send only instagram link/url</b>`, {
                    parse_mode: 'HTML'
                })
            }
        }else{
            ctx.reply(`<b>Hello ${ctx.from.first_name}\nYou need to login in order to download instagram post\nCheck out this video on how to use this bot👇👇\n\n📺 <a href='https://t.me/instaflixdocs/2'>VIDEO TUTORIAL</a>\n\n<a href ='https://telegra.ph/Instagram-Post-Downloader-09-08'>❗️DISCLAIMER</a>\n\nYou need to login to download instagram posts\n*One time login*</b>\n\n`, {
                reply_markup: logo,
                parse_mode: 'HTML'
            })

        }
    }else{
        ctx.reply(`<b>‼️Invalid url send only instagram link/url</b>`, {
            parse_mode: 'HTML'
        })
    }
    await db.close()
})
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

bot.start()