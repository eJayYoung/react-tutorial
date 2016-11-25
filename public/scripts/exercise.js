'use strict'

var Comment = React.createClass({
	rawMarkup:function(){
		var md = new Remarkable();
		var rawMarkup = md.render(this.props.children.toString());
		return {__html:rawMarkup};
	},
	delcommentself:function(){
		this.props.delcomment(this.props.index);
	},
	render:function(){
		return (
			<div className="comment">
				<h2 className="commentAuthor">
					{this.props.author}
				</h2>
				<span dangerouslySetInnerHTML={this.rawMarkup()}/>
				<span className="del" onClick={this.delcommentself}>×</span>
			</div>
		);
	}
	
});

var CommentBox = React.createClass({
	loadCommentsFromServer:function(){
		$.ajax({
			url:this.props.url,
			dataType:'json',
			cache:false,
			success:function(data){
				this.setState({data:data});
			}.bind(this),
			error:function(xhr,status,err){
				console.error(this.props.url,status,err.toString());
			}.bind(this)
		})
	},
	handleCommentSubmit: function(comment){
		var comments = this.state.data;
		comment.id = Date.now();
		var newComments = comments.concat([comment]);
		this.setState({data:newComments});
		$.ajax({
			url:this.props.url+'_add',
			dataType:'json',
			type:'POST',
			data:comment,
			success:function(data){
				this.setState({data:data})
			}.bind(this),
			error:function(xhr,status,err){
				this.setState({data:comments})
				console.error(this.props.url,status,err.toString());
			}.bind(this)
		})
	},
	delcomment: function(index){
		$.ajax({
			url:this.props.url+'_del',
			dataType:'json',
			type:'POST',
			data:index,
			success:function(data){
				this.state.data.splice(data,1);
				this.setState({data:this.state.data});
			}.bind(this),
			error:function(xhr,status,err){
				console.error(this.props.url,status,err.toString());
			}.bind(this)
		});
	},
	getInitialState:function(){
		return {data:[]};
	},

	componentDidMount:function(){
		this.loadCommentsFromServer();
		setInterval(this.loadCommentsFromServer,this.props.pollInterval);
	},
	render:function(){
		return (
			<div className="commentBox">
				<h1>Comments</h1>
				<CommentList data={this.state.data} delcomment={this.delcomment}/>
				<CommentForm onCommentSubmit={this.handleCommentSubmit}/>
			</div>
		);
	}
});

var CommentList = React.createClass({
	render:function(){
		var that = this;
		var commentNodes = this.props.data.map(function(comment,index){
			return (
				<Comment author={comment.author} key={comment.id} index={index} delcomment={that.props.delcomment}>
					{comment.text}
				</Comment>
			);
		})

		return (
			<div className="commentList">
				{commentNodes}
			</div>
		);
	}
});

var CommentForm = React.createClass({
	getInitialState:function(){
		return {author: '',text: ''};
	},
	handleAuthorChange: function(e){
		this.setState({author:e.target.value});
	},
	handleTextChange: function(e){
		this.setState({text: e.target.value});
	},
	handleSubmit:function(e){
		e.preventDefault();
		var author = this.state.author.trim();
		var text =this.state.text.trim();
		if(!author || !text){
			return ;
		}
		this.props.onCommentSubmit({author: author,text: text});
		this.setState({author:'',text:''});
	},
	render:function(){
		return (
			<form className="commentsForm" onSubmit={this.handleSubmit}>
				<input 
					type="text" 
					placeholder="Your name"
					value={this.state.author}
					onChange={this.handleAuthorChange} />
				<input 
					type="text" 
					placeholder="say something..."
					value={this.state.text}
					onChange={this.handleTextChange} />
				<input type="submit" value="Post" />
			</form>
		);
	}
});


ReactDOM.render(
	<CommentBox url="/api/comments" pollInterval={200000} />,
	document.getElementById('content')
);






























































