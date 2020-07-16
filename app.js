const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const lodash = require('lodash');
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');
mongoose.set('useFindAndModify', false);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];




////////////////////////////////////////////////////////////
//////////////////////// DATABASE //////////////////////////
////////////////////////////////////////////////////////////

// CONNECTION
const url = "mongodb+srv://Admin_C0:mVzUfE3kevhSNkVj@cluster0.a79fn.mongodb.net/todolistDB"

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology:true});

// ||||||||||||||||||||||| LIST ||||||||||||||||||||||||| \\
// SCHEMA \\
const itemsScheama = new mongoose.Schema({
  name: String
});

// MODEL \\
const Item = mongoose.model("item", itemsScheama);

// OBJECTS OR ENTRIES \\
const item1 = new Item({
  name: "WELCOME!"
});

const item2 = new Item({
  name: "Enter your text and hit + to add"
});

const item3 = new Item({
  name: "<<< Click the box to delete an item"
});

const defaultValues = [item1, item2, item3];
//|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||\\
// LISTS \\
// SCHEMA\\
const ListsSchema = new mongoose.Schema({
  name: String,
  items: [itemsScheama]
});
// MODEL
const List = mongoose.model("list", ListsSchema);

// ENTRIES
// const defaultListItem = new List({
//   name: "Today's List",
//   items: defaultValues,
// })

////////////////////////////////////////////////////////////
////////////////////// END DATABASE ////////////////////////
///////////////////////////////////////////////////////////

// home or root route
app.get("/", function(req,res){
  List.find(function(err,foundLists){
    if(!err){
      // if(foundLists.length === 0){
      //   defaultListItem.save();
      //   res.redirect("/");
      // }
      // else{
      //   res.render('main',{listTitle: "Your Lists", newListItems: foundLists}) 
      // }
     res.render('main',{listTitle: "Your Lists", newListItems: foundLists}) 
    
    }
  });
});


app.post("/", function(req,res){
  console.log("working");
  const newListTitle = req.body.newItem;
  console.log("/"+newListTitle);
  res.redirect("/"+newListTitle);
});

app.post("/clicked",function(req,res){
    console.log("Chal raha hai")
    
})


app.post("/deleteList", function(req,res){
  const checkboxId = req.body.checkbox;
  console.log(checkboxId)
  List.findByIdAndRemove({_id:checkboxId},function(err){
    if(err){
      console.log(err);
    }else{
      console.log("List Removed");
      res.redirect('/');
    }
  });
});



///////// TODAY ROUTE
app.get("/today", function(req, res) {

  const day = date.getDate();
  Item.find(function(err, items){
    if(err){
      console.log(err);
    }
    else{
      if(items.length === 0){
        Item.insertMany(defaultValues, function(err){
          if(err){
            console.log(err);
          }else{
            // console.log("Inserted Defaults to DB");
          }
          res.redirect('/');
        });
      }else{
        res.render("list", {listTitle: day, newListItems: items});
      }
  }
});
});

app.post("/today", function(req, res){

  const postListTitle = req.body.list.replace(/\s/g,'');
  const itemName = req.body.newItem;
  const newItemFromForm = new Item({
    name: itemName
  });

  if(postListTitle === date.getDate().replace(/\s/g,'')){
    newItemFromForm.save();
    res.redirect("/today");
  }
  else{
    List.findOne({name:postListTitle}, function(err,foundList){
      if(err){
        console.log(err);
      }else{
        foundList.items.push(newItemFromForm);
        foundList.save();
        res.redirect("/"+postListTitle);
      }
    });
  }
});

app.post("/delete", function(req,res){
  const listDel = req.body.listDel;
  const checkboxId = req.body.checkbox;
  if(listDel.replace(/\s/g,'') === date.getDate().replace(/\s/g,'')){
    Item.findByIdAndRemove(checkboxId.replace(/\s/g,''),function(err){
      // console.log("DELETED THE CHECKED ITEM");
      res.redirect("/today");
    });
  }else{
    List.findOneAndUpdate({name:listDel},{$pull:{items:{_id:checkboxId}}},function(err,foundList){
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/"+listDel);
      }
    });
  }
});


app.get("/:categoty",function(req,res){
  const custumListName = lodash.capitalize(req.params.categoty);
  List.findOne({name:custumListName},function(err,foundList) {
    if(!err){
      if(!foundList){
        const list = new List({
          name:custumListName,
          items:defaultValues
        });
        list.save();
        res.redirect("/"+custumListName)
      }
      else{
        res.render('list', {listTitle: foundList.name, newListItems:foundList.items});
      }
    }
  })

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});



